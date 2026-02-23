'use server'
import { cookies } from 'next/headers'

interface CookiesSetOptions {
  [key: string]: string
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function setCookie(key: string, value: string, options: CookiesSetOptions = {}) {
  const cookieStore = await cookies()
  cookieStore.set(key, value, options)
}

export async function removeCookie(key: string) {
  const cookieStore = await cookies()
  cookieStore.set(key, '', { maxAge: 0 })
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function getCookie(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get('token')?.value
}
