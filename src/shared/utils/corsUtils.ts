import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_APP_URL ?? ''

export const corsHeaders = {
  // Restrict to same app origin — no wildcard for a same-origin proxy
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
}

export function createCorsResponse(data?: unknown, status = 200): NextResponse {
  return NextResponse.json(data || {}, { status, headers: corsHeaders })
}

export function handleOptions(request: NextRequest): NextResponse {
  const origin = request.headers.get('origin') ?? ''

  // Reject preflight from unknown origins
  if (ALLOWED_ORIGIN && origin !== ALLOWED_ORIGIN) {
    return new NextResponse(null, { status: 403 })
  }

  return new NextResponse(null, { status: 200, headers: corsHeaders })
}
