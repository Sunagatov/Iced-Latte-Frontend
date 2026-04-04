'use server'
import { cookies } from 'next/headers'

const TOKEN_COOKIE_OPTIONS = {
  path: '/',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
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

  return cookieStore.get('token')?.value
}
