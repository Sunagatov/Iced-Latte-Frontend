import type { NextRequest, NextResponse } from 'next/server'
import { COOKIE_NAMES } from '@/shared/auth/cookieNames'
import { isTokenExpired } from '@/shared/auth/token'
import { secureCookieSuffix } from '@/shared/config/runtime'
import {
  AUTH_COOKIE_OPTIONS,
  AUTH_TOKEN_RESPONSE_PATHS,
  getApiBaseUrl,
} from './proxyConstants'
import { fetchWithTimeout } from './proxyRequest'

export type TokenPair = {
  token: string
  refreshToken: string
}

function isTokenPair(data: unknown): data is TokenPair {
  if (typeof data !== 'object' || data === null) return false
  const d = data as Record<string, unknown>

  return (
    typeof d['token'] === 'string' &&
    typeof d['refreshToken'] === 'string'
  )
}

export function setAuthCookies(
  nextResponse: NextResponse,
  data: unknown,
  path: string,
): void {
  if (
    !AUTH_TOKEN_RESPONSE_PATHS.includes(path) ||
    !isTokenPair(data)
  ) {
    return
  }

  nextResponse.headers.append(
    'Set-Cookie',
    `token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax${secureCookieSuffix()}`,
  )
  nextResponse.headers.append(
    'Set-Cookie',
    `refreshToken=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax${secureCookieSuffix()}`,
  )

  nextResponse.cookies.set(COOKIE_NAMES.access, data.token, AUTH_COOKIE_OPTIONS)
  nextResponse.cookies.set(
    COOKIE_NAMES.refresh,
    data.refreshToken,
    AUTH_COOKIE_OPTIONS,
  )
}

export function responseBodyForClient(data: unknown, path: string): unknown {
  if (
    AUTH_TOKEN_RESPONSE_PATHS.includes(path) &&
    isTokenPair(data)
  ) {
    return { authenticated: true }
  }

  return data
}

async function refreshTokens(
  refreshToken: string,
): Promise<TokenPair | null> {
  const apiBaseUrl = getApiBaseUrl()

  if (!apiBaseUrl) return null

  try {
    const response = await fetchWithTimeout(`${apiBaseUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) return null

    const data: unknown = await response.json()

    return isTokenPair(data) ? data : null
  } catch {
    return null
  }
}

export async function refreshAuthHeaderIfNeeded(
  request: NextRequest,
  safePath: string,
  headers: Record<string, string>,
): Promise<TokenPair | null> {
  if (safePath === 'auth/refresh' || headers['Authorization']) {
    return null
  }

  const refreshToken = request.cookies.get(COOKIE_NAMES.refresh)?.value

  if (!refreshToken || isTokenExpired(refreshToken)) {
    return null
  }

  const refreshedTokens = await refreshTokens(refreshToken)

  if (refreshedTokens) {
    headers['Authorization'] = `Bearer ${refreshedTokens.token}`
  }

  return refreshedTokens
}

export function setRefreshedAuthCookies(
  nextResponse: NextResponse,
  refreshedTokens: TokenPair | null,
): void {
  if (!refreshedTokens) return

  nextResponse.cookies.set(
    COOKIE_NAMES.access,
    refreshedTokens.token,
    AUTH_COOKIE_OPTIONS,
  )
  nextResponse.cookies.set(
    COOKIE_NAMES.refresh,
    refreshedTokens.refreshToken,
    AUTH_COOKIE_OPTIONS,
  )
}
