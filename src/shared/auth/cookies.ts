'use server'
import { cookies } from 'next/headers'
import { isHttpsFrontend } from '@/shared/config/runtime'
import { COOKIE_NAMES } from '@/shared/auth/cookieNames'

const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24

const TOKEN_COOKIE_OPTIONS = {
  path: '/',
  httpOnly: true,
  secure: isHttpsFrontend(),
  sameSite: 'lax' as const,
  maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
}

export async function setCookie(key: string, value: string) {
  const cookieStore = await cookies()

  cookieStore.set(key, value, TOKEN_COOKIE_OPTIONS)
}

export async function removeCookie(key: string) {
  const cookieStore = await cookies()

  cookieStore.set(key, '', { ...TOKEN_COOKIE_OPTIONS, maxAge: 0 })
}

export async function getCookie(): Promise<string | undefined> {
  const cookieStore = await cookies()

  return cookieStore.get(COOKIE_NAMES.access)?.value
}

export async function getRefreshCookie(): Promise<string | undefined> {
  const cookieStore = await cookies()

  return cookieStore.get(COOKIE_NAMES.refresh)?.value
}

export async function setAuthCookies(token: string, refreshToken: string) {
  const cookieStore = await cookies()

  cookieStore.set(COOKIE_NAMES.access, token, TOKEN_COOKIE_OPTIONS)
  cookieStore.set(COOKIE_NAMES.refresh, refreshToken, TOKEN_COOKIE_OPTIONS)
}

export async function clearAuthCookies() {
  const cookieStore = await cookies()

  cookieStore.set(COOKIE_NAMES.access, '', { ...TOKEN_COOKIE_OPTIONS, maxAge: 0 })
  cookieStore.set(COOKIE_NAMES.refresh, '', { ...TOKEN_COOKIE_OPTIONS, maxAge: 0 })
}
