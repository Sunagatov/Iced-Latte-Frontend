const SESSION_KEY = 'il_session_id'

function generateId(): string {
  return crypto.randomUUID()
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem(SESSION_KEY)
  if (!id) {
    id = generateId()
    localStorage.setItem(SESSION_KEY, id)
  }
  return id
}

export function generateTraceId(): string {
  return generateId()
}
