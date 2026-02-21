import { NextRequest, NextResponse } from 'next/server'
import { createCorsResponse, handleOptions } from '@/utils/corsUtils'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL!

export async function OPTIONS() {
  return handleOptions()
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const url = new URL(request.url)
  const apiUrl = `${API_BASE_URL}/${path.join('/')}${url.search}`
  
  try {
    const response = await fetch(apiUrl)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    const data = await response.json()
    return createCorsResponse(data)
  } catch {
    return createCorsResponse({ products: [], totalPages: 0, page: 0, size: 0 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const body = await request.json()
  const apiUrl = `${API_BASE_URL}/${path.join('/')}`
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      return createCorsResponse(data, response.status)
    }
    
    return createCorsResponse(data)
  } catch {
    return createCorsResponse({ error: 'API unavailable' }, 503)
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const body = await request.json()
  const apiUrl = `${API_BASE_URL}/${path.join('/')}`
  
  try {
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    const data = await response.json()
    return createCorsResponse(data)
  } catch {
    return createCorsResponse({ error: 'API unavailable' }, 503)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const apiUrl = `${API_BASE_URL}/${path.join('/')}`
  
  try {
    const response = await fetch(apiUrl, { method: 'DELETE' })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    const data = await response.json()
    return createCorsResponse(data)
  } catch {
    return createCorsResponse({ error: 'API unavailable' }, 503)
  }
}