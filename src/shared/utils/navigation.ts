const SAFE_NEXT_BASE = 'https://iced-latte.local'

export function getSafeNext(next: string | null | undefined): string | null {
  if (!next || !next.trim() || next.includes('\\')) {
    return null
  }

  try {
    const url = new URL(next, SAFE_NEXT_BASE)

    if (url.origin !== SAFE_NEXT_BASE || !url.pathname.startsWith('/')) {
      return null
    }

    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return null
  }
}
