export function redirectToAuthProvider(url: string): void {
  if (!url.startsWith('/api/auth/')) {
    throw new Error('Invalid auth provider URL')
  }

  window.location.assign(url)
}
