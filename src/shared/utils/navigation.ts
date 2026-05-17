export function getSafeNext(next: string | null | undefined): string | null {
  if (
    !next ||
    !next.trim() ||
    next.includes('\\') ||
    !next.startsWith('/') ||
    next.startsWith('//')
  ) {
    return null
  }

  try {
    const [pathWithQuery, hash = ''] = next.split('#', 2)
    const [pathname, query = ''] = pathWithQuery.split('?', 2)

    if (!pathname.startsWith('/')) {
      return null
    }

    return `${pathname}${query ? `?${query}` : ''}${hash ? `#${hash}` : ''}`
  } catch {
    return null
  }
}
