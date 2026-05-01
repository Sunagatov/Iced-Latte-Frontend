import { create, type StateCreator } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  hydrateFavouritesStore,
  syncFavouritesStoreWithSession,
} from '@/features/favorites/favorites.sync'
import {
  toggleFavouriteInStore,
} from '@/features/favorites/favorites.mutations'
import {
  type FavStatus,
  type FavStoreGet,
  type FavStoreSet,
  type FavStoreSlice,
} from '@/features/favorites/state/favoritesStore.utils'

export type { FavStatus } from '@/features/favorites/state/favoritesStore.utils'

type FavSliceState = FavStoreSlice

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

  toggleFavourite: (id) =>
    toggleFavouriteInStore(set as FavStoreSet, get as FavStoreGet, id),
  hydrate: (signal) =>
    hydrateFavouritesStore(set as FavStoreSet, get as FavStoreGet, signal),
  syncSession: (signal) =>
    syncFavouritesStoreWithSession(
      set as FavStoreSet,
      get as FavStoreGet,
      signal,
    ),

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
