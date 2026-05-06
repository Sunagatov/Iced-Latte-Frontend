import { NextRequest, NextResponse } from 'next/server'

const NO_BODY_STATUSES = new Set([204, 205, 304])

function getAllowedOrigin(): string {
  return process.env.NEXT_PUBLIC_FRONTEND_URL ?? ''
}

export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': getAllowedOrigin(),
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
  }
}

export function createCorsResponse(data?: unknown, status = 200): NextResponse {
  if (NO_BODY_STATUSES.has(status)) {
    return new NextResponse(null, { status, headers: corsHeaders() })
  }

  return NextResponse.json(data === undefined ? {} : data, {
    status,
    headers: corsHeaders(),
  })
}

export function handleOptions(request: NextRequest): NextResponse {
  const origin = request.headers.get('origin') ?? ''
  const allowed = getAllowedOrigin()

  if (allowed && origin !== allowed) {
    return new NextResponse(null, { status: 403 })
  }

  return new NextResponse(null, { status: 200, headers: corsHeaders() })
}
