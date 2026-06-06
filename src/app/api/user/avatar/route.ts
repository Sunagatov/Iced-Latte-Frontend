import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { API_BASE_URL } from '@/app/api/proxy/[...path]/proxyConstants'
import {
  fetchWithTimeout,
  forwardHeaders,
} from '@/app/api/proxy/[...path]/proxyRequest'
import {
  refreshAuthHeaderIfNeeded,
  setRefreshedAuthCookies,
} from '@/app/api/proxy/[...path]/proxyAuth'

const IMAGE_CONTENT_TYPE_PREFIX = 'image/'
const LOCAL_AVATAR_HOSTS = new Set(['localhost', '127.0.0.1', '::1'])

function imageResponse(
  body: BodyInit,
  status: number,
  contentType: string,
): NextResponse {
  return new NextResponse(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': contentType,
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

function emptyResponse(status: number): NextResponse {
  return new NextResponse(null, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

function isAllowedAvatarUrl(avatarUrl: URL): boolean {
  if (avatarUrl.protocol === 'https:') {
    return true
  }

  return (
    process.env.NODE_ENV !== 'production' &&
    avatarUrl.protocol === 'http:' &&
    LOCAL_AVATAR_HOSTS.has(avatarUrl.hostname)
  )
}

function parseAvatarUrl(rawAvatarUrl: string): URL | null {
  try {
    const avatarUrl = new URL(rawAvatarUrl.trim())

    return isAllowedAvatarUrl(avatarUrl) ? avatarUrl : null
  } catch {
    return null
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!API_BASE_URL) {
    return emptyResponse(503)
  }

  const headers = forwardHeaders(request, 'users/avatar') as Record<string, string>
  const refreshedTokens = await refreshAuthHeaderIfNeeded(
    request,
    'users/avatar',
    headers,
  )

  let avatarLinkResponse: Response

  try {
    avatarLinkResponse = await fetchWithTimeout(`${API_BASE_URL}/users/avatar`, {
      method: 'GET',
      headers,
    })
  } catch {
    return emptyResponse(503)
  }

  if (!avatarLinkResponse.ok) {
    return emptyResponse(avatarLinkResponse.status)
  }

  const avatarUrl = parseAvatarUrl(await avatarLinkResponse.text())

  if (!avatarUrl) {
    return emptyResponse(502)
  }

  let storageResponse: Response

  try {
    storageResponse = await fetchWithTimeout(avatarUrl.toString(), {
      method: 'GET',
    })
  } catch {
    return emptyResponse(502)
  }

  if (!storageResponse.ok || !storageResponse.body) {
    return emptyResponse(502)
  }

  const contentType = storageResponse.headers.get('content-type') ?? ''

  if (!contentType.toLowerCase().startsWith(IMAGE_CONTENT_TYPE_PREFIX)) {
    return emptyResponse(502)
  }

  const response = imageResponse(storageResponse.body, 200, contentType)

  setRefreshedAuthCookies(response, refreshedTokens)

  return response
}
