import { useAuthStore } from '@/features/auth/store'
import { captureAccountScope } from '@/features/auth/accountScope'
import { isSyncRejected, readConfirmed } from './syncCommands'
import { toastError } from '@/shared/utils/apiError'
import type { Resource } from './resourceState'

// Legacy mutations such as multipart uploads do not create sync commands.
// Publish only an invalidation hint; other tabs still read authoritative data.
export function notifyResourceUpdate(resource: Resource, owner?: string): void {
  if (!owner || typeof window === 'undefined') return
  try {
    localStorage.setItem(`iced-sync-resource:${owner}:${resource}`, crypto.randomUUID())
  } catch {
    // Focus/visibility refresh remains available when storage is blocked.
  }
}

// Notifications only request a fresh read. Server receipts/revisions still
// decide correctness when notifications are delayed or missed.
export function startResourceUpdates(): () => void {
  const scope = captureAccountScope()
  let active = true
  const flights = new Map<Resource, { again: boolean }>()
  const refresh = (resource: Resource) => {
    if (!active || !scope.isCurrent()) return
    const existing = flights.get(resource)

    if (existing) {
      existing.again = true

      return
    }
    const flight = { again: false }

    flights.set(resource, flight)
    void (async () => {
      try {
        do {
          flight.again = false
          await readConfirmed(resource).catch((error) => {
            if (isSyncRejected(error) && scope.isCurrent()) toastError(error)
          })
        } while (flight.again && active && scope.isCurrent())
      } finally {
        flights.delete(resource)
      }
    })()
  }
  const focus = () => {
    if (document.visibilityState !== 'hidden')
      for (const resource of ['cart', 'favourites', 'profile'] as const)
        refresh(resource)
  }
  const storage = (event: StorageEvent) => {
    if (!event.key) return
    const legacyUpdate = event.key?.startsWith('iced-sync-resource:') && event.newValue !== null
    const completedCommand = event.key?.startsWith('iced-sync-operation:') && event.newValue === null

    if (!legacyUpdate && !completedCommand) return
    const [, owner, resource] = event.key.split(':')

    if (
      owner === useAuthStore.getState().userData?.id &&
      ['cart', 'favourites', 'profile'].includes(resource)
    )
      refresh(resource as Resource)
  }

  window.addEventListener('focus', focus)
  document.addEventListener('visibilitychange', focus)
  window.addEventListener('storage', storage)

  return () => {
    active = false
    window.removeEventListener('focus', focus)
    document.removeEventListener('visibilitychange', focus)
    window.removeEventListener('storage', storage)
  }
}
