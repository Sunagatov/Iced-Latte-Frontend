const CONTROL_CHAR_RE = /[\u0000-\u001F\u007F]/
const ENCODED_UNSAFE_PATH_RE = /%(?:0[0-9a-f]|1[0-9a-f]|7f|2f|5c)/i

export function getSafeNext(next: string | null | undefined): string | null {
  const trimmed = next?.trim()

  if (
    !trimmed ||
    trimmed !== next ||
    CONTROL_CHAR_RE.test(next) ||
    ENCODED_UNSAFE_PATH_RE.test(next) ||
    next.includes('\\') ||
    !next.startsWith('/') ||
    next.startsWith('//')
  ) {
    return null
  }

  try {
    const parsed = new URL(next, 'https://iced-latte.local')

    if (
      parsed.origin !== 'https://iced-latte.local' ||
      !parsed.pathname.startsWith('/')
    ) {
      return null
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`
  } catch {
    return null
  }
}
