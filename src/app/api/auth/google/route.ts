import { NextRequest, NextResponse } from 'next/server'
import { getSafeNext } from '@/shared/utils/navigation'
import { getBackendOAuthUrl, getFrontendOrigin } from './oauthUrls'

export async function GET(request: NextRequest) {
  const requestedNext = request.nextUrl.searchParams.get('next')
  const next = getSafeNext(requestedNext)

  if (requestedNext && !next) {
    return new NextResponse(null, { status: 400 })
  }

  const backendUrl = getBackendOAuthUrl('/auth/oauth/google')

  if (!backendUrl) {
    return NextResponse.json(
      { error: 'Google OAuth is not configured' },
      { status: 500 },
    )
  }

  const callbackUrl = new URL(
    '/auth/google/callback',
    getFrontendOrigin(request),
  )

  if (next) {
    callbackUrl.searchParams.set('next', next)
  }

  backendUrl.searchParams.set('redirectUrl', callbackUrl.toString())

  return NextResponse.redirect(backendUrl.toString())
}
