import type { IProduct } from '@/features/products/public'

export type FavStatus = 'idle' | 'syncing' | 'ready' | 'error'

export type FavState = {
  favouriteIds: string[]
  favourites: IProduct[]
  isSync: boolean
  pendingIds: Set<string>
  status: FavStatus
}

export type FavSet = {
  (partial: Partial<FavState>): void
  (fn: (state: FavState) => Partial<FavState>): void
}

export type FavGet = () => FavState
