'use server'
import { cookies } from 'next/headers'

interface CookiesSetOptions {
  [key: string]: string
}

 
export async function setCookie(key: string, value: string, options: CookiesSetOptions = {}) {
  const cookieStore = await cookies()

  cookieStore.set(key, value, options)
}

export async function removeCookie(key: string) {
  const cookieStore = await cookies()

  cookieStore.set(key, '', { maxAge: 0 })
}

 
export async function getCookie(): Promise<string | undefined> {
  const cookieStore = await cookies()

  return cookieStore.get('token')?.value
}
