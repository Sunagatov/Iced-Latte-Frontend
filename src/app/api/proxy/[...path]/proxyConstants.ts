import { isHttpsFrontend } from '@/shared/config/runtime'
import { getAllowedFrontendOrigins } from '@/shared/config/frontendOrigins'

export function getApiBaseUrl(): string | undefined {
  if (process.env.NODE_ENV === 'production') {
    return process.env.INTERNAL_API_URL
  }

  return process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL
}

export const FETCH_TIMEOUT_MS = 30000
export const MAX_PROXY_BODY_BYTES = 5 * 1024 * 1024
export const REQUEST_BODY_TOO_LARGE = Symbol('REQUEST_BODY_TOO_LARGE')

export const ALLOWED_PATH_RE = /^[a-zA-Z0-9/_-]+$/
export const ALLOWED_QUERY_PARAM_RE = /^[a-zA-Z0-9_.~:@!$&'()*+,;=%[\]-]*$/
export const FORWARDED_HEADERS = [
  'X-Session-ID',
  'X-Trace-ID',
  'X-Correlation-ID',
  'Idempotency-Key',
]

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isHttpsFrontend(),
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24,
}

export const AUTH_TOKEN_RESPONSE_PATHS = [
  'auth/authenticate',
  'auth/register',
  'auth/confirm',
  'auth/refresh',
  'auth/oauth/token',
]

export type ProxyMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
