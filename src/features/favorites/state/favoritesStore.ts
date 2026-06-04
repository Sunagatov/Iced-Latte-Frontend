import { create, type StateCreator } from 'zustand'
import { persist } from 'zustand/middleware'
import { type AuthStatus, useAuthStore } from '@/features/auth/store'
import {
  hydrateFavouritesStore,
  syncFavouritesStoreWithSession,
} from '@/features/favorites/favorites.sync'
import {
  toggleFavouriteInStore,
} from '@/features/favorites/favorites.mutations'
import {
  type FavStoreGet,
  type FavStoreSet,
  type FavStoreSlice,
  normalizeFavouriteIds,
} from '@/features/favorites/state/favoritesStore.utils'

export type { FavStatus } from '@/features/favorites/state/favoritesStore.utils'

type FavSliceState = FavStoreSlice

interface FavSliceActions {
  hydrate: (signal?: AbortSignal, authStatus?: AuthStatus) => Promise<void>
  resetFav: () => void
  syncSession: (signal?: AbortSignal, authStatus?: AuthStatus) => Promise<void>
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
    toggleFavouriteInStore(
      set as FavStoreSet,
      get as FavStoreGet,
      id,
      useAuthStore.getState().status === 'authenticated',
    ),
  hydrate: (signal, authStatus = useAuthStore.getState().status) =>
    hydrateFavouritesStore(
      set as FavStoreSet,
      get as FavStoreGet,
      authStatus,
      signal,
    ),
  syncSession: (signal, authStatus = useAuthStore.getState().status) =>
    syncFavouritesStoreWithSession(
      set as FavStoreSet,
      get as FavStoreGet,
      authStatus,
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
        favouriteIds: normalizeFavouriteIds(state.favouriteIds),
        isSync: state.isSync,
      }),
    },
  ),
)
