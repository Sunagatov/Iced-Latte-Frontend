export function isHttpsFrontend(): boolean {
  if (process.env.NODE_ENV === 'production') return true

  return (process.env.NEXT_PUBLIC_FRONTEND_URL ?? '').startsWith('https://')
}

export function secureCookieSuffix(): string {
  return isHttpsFrontend() ? '; Secure' : ''
}
