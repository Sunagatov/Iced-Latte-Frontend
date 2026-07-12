import { NextRequest, NextResponse } from 'next/server'
import { getAllowedFrontendOrigins, resolveAllowedFrontendOrigin } from '@/shared/config/frontendOrigins'

const NO_BODY_STATUSES = new Set([204, 205, 304])

export function corsHeaders(requestOrigin?: string | null) {
  return {
    'Access-Control-Allow-Origin': resolveAllowedFrontendOrigin(requestOrigin),
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Expose-Headers': 'Retry-After',
    'Access-Control-Max-Age': '86400',
  }
}

export function createCorsResponse(
  data?: unknown,
  status = 200,
  requestOrigin?: string | null,
): NextResponse {
  if (NO_BODY_STATUSES.has(status)) {
    return new NextResponse(null, { status, headers: corsHeaders(requestOrigin) })
  }

  return NextResponse.json(data === undefined ? {} : data, {
    status,
    headers: corsHeaders(requestOrigin),
  })
}

export function handleOptions(request: NextRequest): NextResponse {
  const origin = request.headers.get('origin')
  const allowedOrigins = getAllowedFrontendOrigins()

  if (origin && allowedOrigins.length > 0 && !allowedOrigins.includes(origin)) {
    return new NextResponse(null, { status: 403 })
  }

  return new NextResponse(null, { status: 200, headers: corsHeaders(origin) })
}
