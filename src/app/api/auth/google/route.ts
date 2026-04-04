import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_REDIRECT_ORIGINS = (process.env.ALLOWED_REDIRECT_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

export async function GET(request: NextRequest) {
  const redirectUrl = request.nextUrl.searchParams.get('redirectUrl') ?? ''

  if (redirectUrl && !ALLOWED_REDIRECT_ORIGINS.includes(redirectUrl)) {
    return new NextResponse(null, { status: 400 })
  }

  const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/google?redirectUrl=${encodeURIComponent(redirectUrl)}`
  const response = await fetch(backendUrl, { redirect: 'manual' })
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
    } catch {
      return new NextResponse(null, { status: 502 })
    }

    return NextResponse.redirect(location)
  }

  return new NextResponse(null, { status: response.status })
}
