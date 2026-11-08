import { createHash, randomBytes } from 'node:crypto'
import { NextResponse } from 'next/server'
import { OAUTH_VERIFIER_COOKIE } from '@/shared/auth/flowCookies'
import { isHttpsFrontend } from '@/shared/config/runtime'

export function redirectWithOAuthTransaction(backendUrl: URL) {
  const verifier = randomBytes(32).toString('base64url')

  backendUrl.searchParams.set(
    'codeChallenge',
    createHash('sha256').update(verifier).digest('base64url'),
  )
  const response = NextResponse.redirect(backendUrl)

  response.cookies.set(OAUTH_VERIFIER_COOKIE, verifier, {
    httpOnly: true,
    secure: isHttpsFrontend(),
    sameSite: 'lax',
    path: '/api/proxy/auth/oauth/token',
    maxAge: 600,
  })
  response.headers.set('Cache-Control', 'no-store')
  response.headers.set('Referrer-Policy', 'no-referrer')

  return response
}
