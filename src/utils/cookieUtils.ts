'use server'
import { cookies } from 'next/headers'

interface CookiesSetOptions {
  [key: string]: string
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function setCookie(
  key: string,
  value: string,
  options: CookiesSetOptions = {},
) {
  cookies().set(key, value, options)
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function removeCookie(key: string) {
  cookies().set(key, '', { maxAge: 0 })
}
