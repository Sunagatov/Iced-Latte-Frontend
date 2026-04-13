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

  // Redirect to the frontend callback page (not directly to /) so the page can
  // set skipBootstrapRefresh before useSessionBootstrap mounts and fires a
  // stale refresh with the old rotated token.
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

  response.cookies.set('token', token, cookieOptions)
  response.cookies.set('refreshToken', refreshToken, cookieOptions)

  return response
}
