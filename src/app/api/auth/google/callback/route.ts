import { NextRequest, NextResponse } from 'next/server'

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL ?? ''

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  const refreshToken = request.nextUrl.searchParams.get('refreshToken')
  const next = request.nextUrl.searchParams.get('next') ?? '/'

  if (!token || !refreshToken) {
    const errorUrl = FRONTEND_URL
      ? new URL('/signin?error=auth_failed', FRONTEND_URL)
      : new URL('/signin?error=auth_failed', request.url)

    return NextResponse.redirect(errorUrl, { status: 302 })
  }

  const base = FRONTEND_URL || new URL('/', request.url).origin
  const callbackPage = new URL('/auth/google/callback', base)

  callbackPage.searchParams.set('next', next)

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24,
  }

  const response = NextResponse.redirect(callbackPage.toString(), { status: 302 })

  // Expire the old token cookies first. The browser processes Set-Cookie headers
  // in order — the new values below will overwrite these in the same response.
  // This prevents the old refreshToken (possibly from a different user) from
  // being sent on any request that fires before the redirect completes.
  response.headers.append(
    'Set-Cookie',
    `token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax${
      process.env.NODE_ENV === 'production' ? '; Secure' : ''
    }`,
  )
  response.headers.append(
    'Set-Cookie',
    `refreshToken=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax${
      process.env.NODE_ENV === 'production' ? '; Secure' : ''
    }`,
  )

  response.cookies.set('token', token, cookieOptions)
  response.cookies.set('refreshToken', refreshToken, cookieOptions)

  return response
}
