import { NextRequest, NextResponse } from 'next/server'
import { getSafeNext } from '@/shared/utils/navigation'
import { ROUTES } from '@/shared/config/routes'
import { COOKIE_NAMES } from '@/shared/auth/cookieNames'
import { isHttpsFrontend, secureCookieSuffix } from '@/shared/config/runtime'

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL ?? ''
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isHttpsFrontend(),
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24,
}

function buildErrorRedirect(request: NextRequest) {
  const base = FRONTEND_URL
    ? new URL(`${ROUTES.signin}?error=auth_failed`, FRONTEND_URL)
    : new URL(`${ROUTES.signin}?error=auth_failed`, request.url)
  const next = getSafeNext(request.nextUrl.searchParams.get('next'))

  if (next) {
    base.searchParams.set('next', next)
  }

  return base
}

function createSessionCookieResponse(token: string, refreshToken: string) {
  const response = NextResponse.json({ ok: true })

  // Expire the old token cookies first. The browser processes Set-Cookie headers
  // in order — the new values below will overwrite these in the same response.
  // This prevents the old refreshToken (possibly from a different user) from
  // being sent on any request that fires before the redirect completes.
  response.headers.append(
    'Set-Cookie',
    `token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax${secureCookieSuffix()}`,
  )
  response.headers.append(
    'Set-Cookie',
    `refreshToken=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax${secureCookieSuffix()}`,
  )

  response.cookies.set(COOKIE_NAMES.access, token, COOKIE_OPTIONS)
  response.cookies.set(COOKIE_NAMES.refresh, refreshToken, COOKIE_OPTIONS)

  return response
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  const refreshToken = request.nextUrl.searchParams.get('refreshToken')

  if (!token || !refreshToken) {
    return NextResponse.redirect(buildErrorRedirect(request), { status: 302 })
  }

  return createSessionCookieResponse(token, refreshToken)
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      token?: string
      refreshToken?: string
    }

    if (!body.token || !body.refreshToken) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    return createSessionCookieResponse(body.token, body.refreshToken)
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}
