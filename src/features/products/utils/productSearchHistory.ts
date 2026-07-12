const RECENT_KEY = 'il_recent_searches'
const MAX_RECENT = 5

export function getRecentSearches(): string[] {
  try {
    const rawValue = localStorage.getItem(RECENT_KEY)
    const parsed: unknown = JSON.parse(rawValue ?? '[]')

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter(
      (item: unknown): item is string => typeof item === 'string',
    )
  } catch {
    return []
  }
}

export function saveRecentSearch(query: string): void {
  const previousQueries = getRecentSearches().filter((item) => item !== query)

  localStorage.setItem(
    RECENT_KEY,
    JSON.stringify([query, ...previousQueries].slice(0, MAX_RECENT)),
  )
}

export function deleteRecentSearch(query: string): void {
  localStorage.setItem(
    RECENT_KEY,
    JSON.stringify(getRecentSearches().filter((item) => item !== query)),
  )
}
