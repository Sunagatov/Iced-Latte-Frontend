function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1]

    if (!payload) return null

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      '=',
    )

    const decoded =
      typeof window === 'undefined'
        ? Buffer.from(padded, 'base64').toString('utf-8')
        : atob(padded)

    return JSON.parse(decoded) as Record<string, unknown>
  } catch {
    return null
  }
}

export function isTokenExpired(token?: string | null): boolean {
  if (!token) return true

  const payload = decodeJwtPayload(token)
  const exp = payload?.exp

  if (typeof exp !== 'number') return true

  return exp * 1000 <= Date.now()
}