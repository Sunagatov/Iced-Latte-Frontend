import { create, type StateCreator } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  hydrateFavouritesStore,
  syncFavouritesStoreWithSession,
} from '@/features/favorites/favorites.sync'
import {
  toggleFavouriteInStore,
} from '@/features/favorites/favorites.mutations'
import type { FavStatus } from '@/features/favorites/favorites.service.types'
import type { IProduct } from '@/features/products/public'

export type { FavStatus } from '@/features/favorites/favorites.service.types'

interface FavSliceState {
  favouriteIds: string[]
  favourites: IProduct[]
  status: FavStatus
  pendingIds: Set<string>
  isSync: boolean
}

interface FavSliceActions {
  hydrate: (signal?: AbortSignal) => Promise<void>
  resetFav: () => void
  syncSession: (signal?: AbortSignal) => Promise<void>
  toggleFavourite: (id: string) => Promise<void>
}

export type FavStoreState = FavSliceState & FavSliceActions

const initialState: FavSliceState = {
  favouriteIds: [],
  favourites: [],
  status: 'idle',
  pendingIds: new Set<string>(),
  isSync: false,
}

const createFavSlice: StateCreator<FavStoreState, [], [], FavStoreState> = (
  set,
  get,
) => ({
  ...initialState,

  toggleFavourite: (id) => toggleFavouriteInStore(set, get, id),
  hydrate: (signal) => hydrateFavouritesStore(set, get, signal),
  syncSession: (signal) => syncFavouritesStoreWithSession(set, get, signal),

  resetFav: () =>
    set({
      favouriteIds: [],
      favourites: [],
      isSync: false,
      pendingIds: new Set<string>(),
      status: 'idle',
    }),
})

export const useFavouritesStore = create<FavStoreState>()(
  persist<FavStoreState, [], [], Pick<FavSliceState, 'favouriteIds' | 'isSync'>>(
    createFavSlice,
    {
      name: 'fav-storage',
      partialize: (state): Pick<FavSliceState, 'favouriteIds' | 'isSync'> => ({
        favouriteIds: state.favouriteIds,
        isSync: state.isSync,
      }),
    },
  ),
)
