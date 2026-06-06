import { NextRequest, NextResponse } from 'next/server'
import { getSafeNext } from '@/shared/utils/navigation'

function getFrontendOrigin(request: NextRequest): string {
  const configuredFrontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL

  if (!configuredFrontendUrl) return request.nextUrl.origin

  try {
    return new URL(configuredFrontendUrl).origin
  } catch {
    return request.nextUrl.origin
  }
}

export async function GET(request: NextRequest) {
  const requestedNext = request.nextUrl.searchParams.get('next')
  const next = getSafeNext(requestedNext)

  if (requestedNext && !next) {
    return new NextResponse(null, { status: 400 })
  }

  const backendUrl = new URL(`${process.env.NEXT_PUBLIC_API_URL}/auth/oauth/google`)

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
