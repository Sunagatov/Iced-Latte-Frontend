import { NextResponse } from 'next/server'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
}

export function createCorsResponse(data?: unknown, status = 200): NextResponse {
  return NextResponse.json(data || {}, { status, headers: corsHeaders })
}

export function handleOptions(): NextResponse {
  return new NextResponse(null, { status: 200, headers: corsHeaders })
}
