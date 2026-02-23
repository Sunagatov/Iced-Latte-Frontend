import { NextRequest, NextResponse } from 'next/server'
import { createCorsResponse, handleOptions } from '@/shared/utils/corsUtils'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL!

const FORWARDED_HEADERS = ['Authorization', 'X-Session-ID', 'X-Trace-ID', 'X-Correlation-ID']

function forwardHeaders(request: NextRequest): HeadersInit {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  for (const name of FORWARDED_HEADERS) {
    const value = request.headers.get(name)
    if (value) headers[name] = value
  }
  return headers
}

export async function OPTIONS() {
  return handleOptions()
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const url = new URL(request.url)
  const apiUrl = `${API_BASE_URL}/${path.join('/')}${url.search}`

  try {
    const response = await fetch(apiUrl, { headers: forwardHeaders(request) })
    const contentType = response.headers.get('content-type') ?? ''
    const data = contentType.includes('application/json')
      ? await response.json()
      : await response.text()
    if (!response.ok) return createCorsResponse(data, response.status)
    return createCorsResponse(data)
  } catch {
    return createCorsResponse({ error: 'API unavailable' }, 503)
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const url = new URL(request.url)
  const apiUrl = `${API_BASE_URL}/${path.join('/')}${url.search}`

  let body: string | null = null
  try {
    const text = await request.text()
    body = text || null
  } catch { /* empty body */ }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: forwardHeaders(request),
      body: body ?? undefined,
    })
    const contentType = response.headers.get('content-type') ?? ''
    const data = contentType.includes('application/json')
      ? await response.json()
      : await response.text()
    if (!response.ok) return createCorsResponse(data, response.status)
    return createCorsResponse(data)
  } catch {
    return createCorsResponse({ error: 'API unavailable' }, 503)
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const body = await request.text()
  const apiUrl = `${API_BASE_URL}/${path.join('/')}`

  try {
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: forwardHeaders(request),
      body,
    })
    const contentType = response.headers.get('content-type') ?? ''
    const data = contentType.includes('application/json')
      ? await response.json()
      : await response.text()
    if (!response.ok) return createCorsResponse(data, response.status)
    return createCorsResponse(data)
  } catch {
    return createCorsResponse({ error: 'API unavailable' }, 503)
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const body = await request.text()
  const apiUrl = `${API_BASE_URL}/${path.join('/')}`

  try {
    const response = await fetch(apiUrl, {
      method: 'PATCH',
      headers: forwardHeaders(request),
      body,
    })
    const contentType = response.headers.get('content-type') ?? ''
    const data = contentType.includes('application/json')
      ? await response.json()
      : await response.text()
    if (!response.ok) return createCorsResponse(data, response.status)
    return createCorsResponse(data)
  } catch {
    return createCorsResponse({ error: 'API unavailable' }, 503)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const apiUrl = `${API_BASE_URL}/${path.join('/')}`

  let body: string | undefined
  try {
    const text = await request.text()
    if (text) body = text
  } catch { /* no body */ }

  try {
    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: forwardHeaders(request),
      body,
    })
    if (!response.ok) {
      const contentType = response.headers.get('content-type') ?? ''
      const data = contentType.includes('application/json')
        ? await response.json()
        : await response.text()
      return createCorsResponse(data, response.status)
    }
    const text = await response.text()
    const data = text ? JSON.parse(text) : {}
    return createCorsResponse(data)
  } catch {
    return createCorsResponse({ error: 'API unavailable' }, 503)
  }
}
