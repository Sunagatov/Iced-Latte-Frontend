import { NextRequest, NextResponse } from 'next/server'

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL ?? ''

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    const errorUrl = FRONTEND_URL
      ? new URL('/signin?error=auth_failed', FRONTEND_URL)
      : new URL('/signin?error=auth_failed', request.url)
    return NextResponse.redirect(errorUrl, { status: 302 })
  }

  const home = FRONTEND_URL
    ? new URL('/', FRONTEND_URL).toString()
    : new URL('/', request.url).toString()

  // Return an HTML page that sets the cookie and redirects client-side.
  // This avoids the cross-site cookie drop that happens when Set-Cookie
  // is on a redirect response originating from api.iced-latte.uk.
  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Signing in…</title></head>
<body>
<script>window.location.replace(${JSON.stringify(home)})</script>
</body>
</html>`

  const response = new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html' },
  })

  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24,
  })

  return response
}
