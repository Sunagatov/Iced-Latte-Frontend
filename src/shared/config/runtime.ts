export function isHttpsFrontend(): boolean {
  return (process.env.NEXT_PUBLIC_FRONTEND_URL ?? '').startsWith('https://')
}

export function secureCookieSuffix(): string {
  return isHttpsFrontend() ? '; Secure' : ''
}
