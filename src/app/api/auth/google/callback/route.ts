import { NextRequest, NextResponse } from 'next/server'
import { getSafeNext } from '@/shared/utils/navigation'
import { ROUTES } from '@/shared/config/routes'
import { getFrontendOrigin } from '../../oauthUrls'

function buildErrorRedirect(request: NextRequest) {
  const base = new URL(ROUTES.signin, getFrontendOrigin(request))
  const next = getSafeNext(request.nextUrl.searchParams.get('next'))

  base.searchParams.set('error', 'auth_failed')

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
