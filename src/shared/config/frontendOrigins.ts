function normalizeOrigin(raw: string | undefined): string | undefined {
  if (!raw) return undefined

  try {
    return new URL(raw).origin
  } catch {
    return undefined
  }
}

export function getAllowedFrontendOrigins(): string[] {
  const configuredOrigin = normalizeOrigin(process.env.NEXT_PUBLIC_FRONTEND_URL)

  if (!configuredOrigin) return []

  const configuredUrl = new URL(configuredOrigin)
  const allowedOrigins = new Set([configuredOrigin])

  if (process.env.NODE_ENV === 'production') {
    const hostname = configuredUrl.hostname

    if (hostname.includes('.')) {
      const alternateHostname = hostname.startsWith('www.')
        ? hostname.slice(4)
        : `www.${hostname}`

      allowedOrigins.add(
        `${configuredUrl.protocol}//${alternateHostname}${configuredUrl.port ? `:${configuredUrl.port}` : ''}`,
      )
    }
  }

  return [...allowedOrigins]
}

export function resolveAllowedFrontendOrigin(
  requestOrigin?: string | null,
): string {
  const allowedOrigins = getAllowedFrontendOrigins()

  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    return requestOrigin
  }

  return allowedOrigins[0] ?? ''
}
