import { useSyncExternalStore } from 'react'

export const useStoreData = <T, F>(
  store: any,
  callback: (state: T) => F,
) => {
  const getSnapshot = () => callback(store.getState())
  return useSyncExternalStore(
    store.subscribe,
    getSnapshot,
    getSnapshot
  )
}
