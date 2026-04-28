import { NextRequest, NextResponse } from 'next/server'

function isSafePath(value: string): boolean {
  return /^\/[a-zA-Z0-9/_-]*$/.test(value)
}

export async function GET(request: NextRequest) {
  const next = request.nextUrl.searchParams.get('next') ?? ''

  if (next && !isSafePath(next)) {
    return new NextResponse(null, { status: 400 })
  }

  const backendUrl = new URL(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`)

  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL ?? ''
  const callbackUrl = new URL(`${frontendUrl}/auth/google/callback`)

  if (next) {
    callbackUrl.searchParams.set('next', next)
  }

  backendUrl.searchParams.set('redirectUrl', callbackUrl.toString())

  const response = await fetch(backendUrl.toString(), { redirect: 'manual' })
  const location = response.headers.get('location')

  if (location) {
    try {
      const locationUrl = new URL(location)

      if (
        locationUrl.protocol !== 'https:' ||
        !locationUrl.hostname.endsWith('.google.com')
      ) {
        return new NextResponse(null, { status: 502 })
      }

      return NextResponse.redirect(locationUrl.toString())
    } catch {
      return new NextResponse(null, { status: 502 })
    }
  }

  return new NextResponse(null, { status: response.status })
}
