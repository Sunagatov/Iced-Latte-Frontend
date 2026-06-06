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

function detectAvatarContentType(bytes: Uint8Array): string | null {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return 'image/jpeg'
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'image/png'
  }

  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'image/webp'
  }

  return null
}

function resolveAvatarContentType(storageResponse: Response, bytes: Uint8Array): string | null {
  const headerContentType = storageResponse.headers.get('content-type') ?? ''
  const normalizedHeaderContentType = headerContentType
    .split(';', 1)[0]
    .trim()
    .toLowerCase()
  const detectedContentType = detectAvatarContentType(bytes)

  if (!detectedContentType) {
    return null
  }

  return normalizedHeaderContentType.startsWith(IMAGE_CONTENT_TYPE_PREFIX)
    ? headerContentType
    : detectedContentType
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength)

  new Uint8Array(buffer).set(bytes)

  return buffer
}

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

  if (!storageResponse.ok) {
    return emptyResponse(502)
  }

  let imageBytes: Uint8Array

  try {
    imageBytes = new Uint8Array(await storageResponse.arrayBuffer())
  } catch {
    return emptyResponse(502)
  }

  const contentType = resolveAvatarContentType(storageResponse, imageBytes)

  if (!contentType) {
    return emptyResponse(502)
  }

  const response = imageResponse(toArrayBuffer(imageBytes), 200, contentType)

  setRefreshedAuthCookies(response, refreshedTokens)

  return response
}
