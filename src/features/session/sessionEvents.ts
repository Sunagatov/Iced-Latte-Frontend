// Only a change signal crosses tabs. Credentials and account data stay out of storage.
export const SESSION_EVENT_KEY = 'iced-session-change'

export function publishSessionChange(type: 'login' | 'logout'): void {
  try {
    localStorage.setItem(SESSION_EVENT_KEY, JSON.stringify({ type, nonce: crypto.randomUUID() }))
  } catch {
    // Storage may be unavailable in private/restricted browsers.
  }
}

export function sessionChangeType(event: StorageEvent): 'login' | 'logout' | null {
  if (event.key !== SESSION_EVENT_KEY || !event.newValue) return null
  try {
    const { type } = JSON.parse(event.newValue)

    return type === 'login' || type === 'logout' ? type : null
  } catch {
    return null
  }
}
