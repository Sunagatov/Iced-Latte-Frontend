import { NextRequest, NextResponse } from 'next/server'
import { createCorsResponse, handleOptions } from '@/utils/corsUtils'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL!

function forwardHeaders(request: NextRequest): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  const auth = request.headers.get('Authorization')
  if (auth) headers['Authorization'] = auth
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
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    return createCorsResponse(data)
  } catch {
    return createCorsResponse({ products: [], totalPages: 0, page: 0, size: 0 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const apiUrl = `${API_BASE_URL}/${path.join('/')}`

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
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
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
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
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
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    return createCorsResponse(data)
  } catch {
    return createCorsResponse({ error: 'API unavailable' }, 503)
  }
}
