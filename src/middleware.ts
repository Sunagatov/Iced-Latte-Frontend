import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return null
}

export const config = {
  matcher: ['/profile'],
}
