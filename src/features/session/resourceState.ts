import type { SyncSnapshot } from '@/shared/api/generated/sync'
import { useAuthStore } from '@/features/auth/store'

export type Resource = 'cart' | 'favourites' | 'profile'
type Listener = (snapshot: SyncSnapshot) => void
const snapshots = new Map<string, SyncSnapshot>()
const listeners = new Map<Resource, Set<Listener>>()

export function confirmedSnapshot(resource: Resource, owner: string) {
  return snapshots.get(`${owner}:${resource}`)
}

// This is the only acceptance point for authenticated resource data. Feature
// stores expose projections for their existing UI; they do not merge responses.
export function acceptSnapshot(
  resource: Resource,
  incoming: SyncSnapshot,
): SyncSnapshot {
  const key = `${incoming.userId}:${resource}`
  const current = snapshots.get(key)

  if (current && incoming.revision < current.revision) return current
  snapshots.set(key, incoming)
  listeners.get(resource)?.forEach((listener) => listener(incoming))

  return incoming
}

export function onSnapshot(resource: Resource, listener: Listener): () => void {
  if (!listeners.has(resource)) listeners.set(resource, new Set())
  listeners.get(resource)!.add(listener)

  return () => {
    listeners.get(resource)?.delete(listener)
  }
}

export function clearResourceState() {
  snapshots.clear()
}

useAuthStore.subscribe((state, previous) => {
  if (state.accountVersion !== previous.accountVersion) clearResourceState()
})
