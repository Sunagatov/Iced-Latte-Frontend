import { create, type StateCreator } from 'zustand'
import { persist } from 'zustand/middleware'
import { accountIdentity, useAuthStore } from '@/features/auth/store'
import { captureAccountScope } from '@/features/auth/accountScope'
import { onSnapshot } from '@/features/session/resourceState'
import type { FavouritesResponse } from '@/features/favorites/favoritesTypes'
import { createCollectionSync } from '@/features/session/collectionSync'
import {
  getClientAuthStatus,
  type AuthStatus,
} from '@/shared/auth/sessionStatus'
import {
  hydrateFavouritesStore,
  syncFavouritesStoreWithSession,
} from '@/features/favorites/favorites.sync'
import { toggleFavouriteInStore } from '@/features/favorites/favorites.mutations'
import {
  type FavStoreGet,
  type FavStoreSet,
  type FavStoreSlice,
  normalizeFavouriteIds,
  mapProductsToFavourites,
} from '@/features/favorites/state/favoritesStore.utils'

export type { FavStatus } from '@/features/favorites/state/favoritesStore.utils'

type FavSliceState = FavStoreSlice

interface FavSliceActions {
  editGuestDraft: (productIds: string[]) => void
  retryGuestDraft: () => Promise<void>
  hydrate: (signal?: AbortSignal, authStatus?: AuthStatus) => Promise<void>
  resetFav: (preserveGuest?: boolean) => void
  syncSession: (signal?: AbortSignal, authStatus?: AuthStatus) => Promise<void>
  toggleFavourite: (id: string) => Promise<void>
}

export type FavStoreState = FavSliceState & FavSliceActions

const initialState: FavSliceState = {
  guestConflict: null,
  pendingSync: null,
  favouriteIds: [],
  favourites: [],
  status: 'idle',
  pendingIds: new Set<string>(),
  isSync: false,
}

const createFavSlice: StateCreator<FavStoreState, [], [], FavStoreState> = (
  set,
  get,
) => {
  const sync = createCollectionSync()

  function mutationSet(signal?: AbortSignal): FavStoreSet {
    const apply = sync.mutation(signal)

    return partial => apply(() => set(partial))
  }

  function loadSet(signal?: AbortSignal): FavStoreSet {
    const request = sync.read(signal)

    return (partial) => {
      if (!request.isCurrent()) return
      set(partial)
    }
  }

  return {
    ...initialState,
    editGuestDraft: (productIds) =>
      set((state) => ({
        guestConflict:
          productIds.length && state.guestConflict
            ? { ...state.guestConflict, productIds }
            : null,
      })),
    retryGuestDraft: async () => {
      const draft = get().guestConflict

      if (!draft) return
      set({
        pendingSync: {
          key: crypto.randomUUID(),
          productIds: draft.productIds,
          accountEmail: useAuthStore.getState().userData?.email ?? null,
        },
      })
      await get().syncSession()
    },

    toggleFavourite: async (id) => {
      const account = captureAccountScope()
      const status = getClientAuthStatus()

      if (status === 'loading') return
      if (status === 'authenticated' && (!get().isSync || get().pendingSync)) {
        await get()
          .syncSession()
          .catch(() => {})
        if (
          !account.isCurrent() ||
          !get().isSync ||
          get().pendingSync ||
          get().guestConflict
        )
          return
      }

      await toggleFavouriteInStore(
        mutationSet(),
        get as FavStoreGet,
        id,
        status === 'authenticated',
      )
    },
    hydrate: (signal, authStatus = getClientAuthStatus()) => {
      if (
        authStatus === 'authenticated' &&
        (get().pendingSync || (!get().isSync && get().favouriteIds.length > 0))
      )
        return get().syncSession(signal, authStatus)

      return hydrateFavouritesStore(
        loadSet(signal),
        get as FavStoreGet,
        authStatus,
        signal,
      )
    },
    syncSession: (signal, authStatus = getClientAuthStatus()) =>
      sync.run(signal, () =>
        syncFavouritesStoreWithSession(
          loadSet(signal),
          get as FavStoreGet,
          authStatus,
          signal,
        ),
      ),

    resetFav: (preserveGuest = false) => {
      sync.reset()
      const current = get()
      const ownsSync =
        !current.pendingSync ||
        current.pendingSync.accountEmail ===
          (useAuthStore.getState().userData?.email ?? null)
      const guest =
        preserveGuest && ownsSync && (!current.isSync || current.pendingSync)
          ? current
          : initialState

      set({
        favouriteIds: guest.favouriteIds,
        guestConflict:
          preserveGuest &&
          current.guestConflict?.accountEmail ===
            useAuthStore.getState().userData?.email
            ? current.guestConflict
            : null,
        pendingSync: guest.pendingSync,
        favourites: guest.favourites,
        isSync: false,
        pendingIds: new Set<string>(),
        status: 'idle',
      })
    },
  }
}

export const useFavouritesStore = create<FavStoreState>()(
  persist<
    FavStoreState,
    [],
    [],
    Pick<
      FavSliceState,
      'favouriteIds' | 'isSync' | 'pendingSync' | 'guestConflict'
    >
  >(createFavSlice, {
    name: 'fav-storage',
    partialize: (
      state,
    ): Pick<
      FavSliceState,
      'favouriteIds' | 'isSync' | 'pendingSync' | 'guestConflict'
    > => ({
      pendingSync: state.pendingSync,
      guestConflict: state.guestConflict,
      favouriteIds: normalizeFavouriteIds(state.favouriteIds),
      isSync: state.isSync,
    }),
  }),
)

onSnapshot('favourites', (snapshot) => {
  const auth = useAuthStore.getState()

  if (
    auth.status !== 'authenticated' ||
    accountIdentity(auth.userData) !== snapshot.userId
  )
    return
  const data = snapshot.data as unknown as FavouritesResponse

  useFavouritesStore.setState({
    ...mapProductsToFavourites(data.products),
    isSync: true,
    status: 'ready',
  })
})
