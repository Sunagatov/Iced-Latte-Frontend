import { NextResponse } from 'next/server'
import { createCorsResponse } from '@/shared/utils/corsUtils'
import {
  responseBodyForClient,
  setAuthCookies,
  setRefreshedAuthCookies,
  type TokenPair,
} from './proxyAuth'

async function parseProxyResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? ''
  const rawBody = await response.text()

  return (contentType.includes('application/json') ||
    contentType.includes('application/problem+json')) &&
    rawBody
    ? (JSON.parse(rawBody) as unknown)
    : rawBody
}

export async function createProxyResponse(
  response: Response,
  safePath: string,
  refreshedTokens: TokenPair | null,
  requestOrigin?: string,
): Promise<NextResponse> {
  const data = await parseProxyResponse(response)

  if (!response.ok) {
    const errorResponse = createCorsResponse(
      data,
      response.status,
      requestOrigin,
    )
    const retryAfter = response.headers.get('Retry-After')

    if (retryAfter) errorResponse.headers.set('Retry-After', retryAfter)

    return errorResponse
  }

  const nextResponse = createCorsResponse(
    responseBodyForClient(data, safePath),
    response.status,
    requestOrigin,
  )

  setAuthCookies(nextResponse, data, safePath)
  setRefreshedAuthCookies(nextResponse, refreshedTokens)

  return nextResponse
}
