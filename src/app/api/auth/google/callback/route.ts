import { NextRequest, NextResponse } from 'next/server'
import { getSafeNext } from '@/shared/utils/navigation'
import { ROUTES } from '@/shared/config/routes'

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL ?? ''

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

export async function GET(request: NextRequest) {
  return NextResponse.redirect(buildErrorRedirect(request), { status: 302 })
}

export async function POST() {
  return NextResponse.json({ ok: false }, { status: 410 })
}
