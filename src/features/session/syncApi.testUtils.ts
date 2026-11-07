import { accountIdentity, useAuthStore } from '@/features/auth/store'
import {
  acceptSnapshot,
  confirmedSnapshot,
  type Resource,
} from './resourceState'

// Feature tests mock domain APIs, one layer above the real command gateway.
// Publish their full snapshots just as the gateway does. A request's revision
// is assigned on invocation, so a delayed older response cannot win.
export function cartApiMock() {
  return {
    fetchCart: responseMock('cart', undefined, true),
    mergeCarts: responseMock('cart'),
    removeCartItem: responseMock('cart'),
    changeCartItemQuantity: responseMock('cart'),
  }
}

export function favouritesApiMock() {
  return {
    fetchFavourites: responseMock(
      'favourites',
      (value) => ({ products: value }),
      true,
    ),
    syncFavourites: responseMock('favourites'),
    removeFavourite: responseMock('favourites', (value, args) => {
      if (value) return value
      const { useFavouritesStore } = jest.requireActual(
        '@/features/favorites/state/favoritesStore',
      )

      return {
        products: useFavouritesStore
          .getState()
          .favourites.filter(
            (product: { id: string }) => product.id !== args[0],
          ),
      }
    }),
  }
}

let sequence = 0

function responseMock(
  resource: Resource,
  data = (value: unknown, _args: unknown[]) => value,
  read = false,
) {
  const mock = jest.fn()

  return new Proxy(mock, {
    apply(target, receiver, args: unknown[]) {
      const auth = useAuthStore.getState()
      const owner = accountIdentity(auth.userData) ?? 'test-owner'
      const scope = auth.accountVersion
      const revision = Math.max(
        ++sequence,
        (confirmedSnapshot(resource, owner)?.revision ?? 0) + 1,
      )

      return Promise.resolve(Reflect.apply(target, receiver, args)).then(
        (value) => {
          const snapshot = data(value, args)
          const responseRevision = read
            ? revision
            : Math.max(
              ++sequence,
              (confirmedSnapshot(resource, owner)?.revision ?? 0) + 1,
            )

          if (snapshot && useAuthStore.getState().accountVersion === scope)
            acceptSnapshot(resource, {
              userId: owner,
              revision: responseRevision,
              data: snapshot as Record<string, unknown>,
            })

          return value
        },
      )
    },
  })
}
