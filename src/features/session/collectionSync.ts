import { captureAccountScope } from '@/features/auth/accountScope'

// Coordinates request lifetimes and guest initialization. Authenticated data
// acceptance belongs to resourceState, not per-product reconciliation here.
export function createCollectionSync() {
  let epoch = 0
  let latestRead = 0
  let flight: { promise: Promise<void>; isCurrent: () => boolean } | null = null
  const writes = new Set<Promise<void>>()

  function scope(signal?: AbortSignal) {
    const account = captureAccountScope()
    const started = epoch

    return () => started === epoch && !signal?.aborted && account.isCurrent()
  }

  return {
    trackWrite(work: () => void | Promise<void>) {
      const result = work()

      if (!result) return
      const promise = Promise.resolve(result)

      writes.add(promise)
      void promise.finally(() => writes.delete(promise)).catch(() => {})

      return promise
    },
    pendingWrites: () => Promise.allSettled([...writes]),
    mutation(signal?: AbortSignal) {
      const isCurrent = scope(signal)

      return (apply: () => void) => {
        if (!isCurrent()) return
        apply()
      }
    },
    read(signal?: AbortSignal) {
      const isCurrent = scope(signal)
      const request = ++latestRead

      return {
        isCurrent: () => isCurrent() && request === latestRead,
      }
    },
    run(signal: AbortSignal | undefined, work: () => Promise<void>) {
      if (signal?.aborted) return Promise.resolve()
      if (flight?.isCurrent()) return flight.promise
      const isCurrent = scope(signal)
      const promise = work()
      const request = { promise, isCurrent }

      flight = request
      void promise
        .finally(() => {
          if (flight === request) flight = null
        })
        .catch(() => {})

      return promise
    },
    reset() {
      epoch += 1
      latestRead += 1
      flight = null
      writes.clear()
    },
  }
}
