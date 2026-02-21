import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { corsHeaders } from './utils/corsUtils'

export function proxy(request: NextRequest) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: corsHeaders })
  }

  // Auth middleware
  if (request.nextUrl.pathname.startsWith('/profile')) {
    const token = request.cookies.get('token')
    if (!token) {
      return NextResponse.redirect(new URL('/signin', request.url))
    }
  }

  // Add CORS headers to all responses
  const response = NextResponse.next()
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  return response
}

export const config = {
  matcher: ['/api/:path*', '/profile'],
}
