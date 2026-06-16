import { NextRequest } from 'next/server'

export function getFrontendOrigin(request: NextRequest): string {
  const configuredFrontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL

  if (!configuredFrontendUrl) {
    return request.nextUrl.origin
  }

  try {
    return new URL(configuredFrontendUrl).origin
  } catch {
    return request.nextUrl.origin
  }
}

export function getBackendOAuthUrl(path: string): URL | null {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  if (!apiUrl) {
    return null
  }

  try {
    const url = new URL(apiUrl)
    const basePath = url.pathname.replace(/\/$/, '')
    const authPath = path.replace(/^\//, '')

    url.pathname = `${basePath}/${authPath}`
    url.search = ''
    url.hash = ''

    return url
  } catch {
    return null
  }
}
