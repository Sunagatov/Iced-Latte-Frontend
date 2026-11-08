import { NextRequest, NextResponse } from 'next/server'
import { RECOVERY_COOKIE } from '@/shared/auth/flowCookies'
import { isHttpsFrontend } from '@/shared/config/runtime'
import { isUrlSafeToken } from '@/features/auth/validation'

export function proxy(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) return NextResponse.next()
  const cleanUrl = request.nextUrl.clone()

  cleanUrl.search = ''
  if (isUrlSafeToken(token)) cleanUrl.searchParams.set('recovery', '1')
  const response = NextResponse.redirect(cleanUrl, 303)

  if (isUrlSafeToken(token))
    response.cookies.set(RECOVERY_COOKIE, token, {
      httpOnly: true,
      secure: isHttpsFrontend() || request.nextUrl.protocol === 'https:',
      sameSite: 'lax',
      path: '/',
      maxAge: 300,
    })
  response.headers.set('Cache-Control', 'no-store')
  response.headers.set('Referrer-Policy', 'no-referrer')

  return response
}
export const config = { matcher: ['/resetpass'] }
