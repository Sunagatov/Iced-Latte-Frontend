import { act, render, renderHook, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { useAuthStore } from '@/features/auth/store'
import { useCartStore } from '@/features/cart/cartStore'
import { useFavouritesStore } from '@/features/favorites/state/favoritesStore'
import { useAddressStore } from '@/features/addresses/store'
import { SyncRejectedError } from '@/features/session/syncCommands'
import * as cartApi from '@/features/cart/cartApi'
import * as favApi from '@/features/favorites/favoritesApi'
import * as addresses from '@/features/addresses/api'
import FormProfile from '@/features/user/components/FormProfile'
import ProfilePersonalDetailsSection from '@/features/user/components/profile/ProfilePersonalDetailsSection'
import { buildProfileSummary } from '@/features/user/components/profile/profileSummary'
import { editUserProfile } from '@/features/user/api'
import { useOrders } from '@/features/orders/useOrders'
import { useFavoriteProductActions } from '@/features/favorites/useFavoriteProductActions'
import { captureAccountScope } from '@/features/auth/accountScope'
import { useProfileOrderCount } from '@/features/user/components/profile/useProfileOrderCount'
import { fetchOrders } from '@/features/orders/ordersApi'
import { fireEvent } from '@testing-library/react'

jest.mock('@/features/auth/public', () =>
  jest.requireActual('@/features/auth/store'),
)
jest.mock('@/features/cart/cartApi', () =>
  jest.requireActual('@/features/session/syncApi.testUtils').cartApiMock(),
)
jest.mock('@/features/favorites/favoritesApi', () =>
  jest
    .requireActual('@/features/session/syncApi.testUtils')
    .favouritesApiMock(),
)
jest.mock('@/features/products/api', () => ({ getProductByIds: jest.fn() }))
jest.mock('@/features/addresses/api', () => ({
  getAddresses: jest.fn(),
  createAddress: jest.fn(),
  updateAddress: jest.fn(),
  deleteAddress: jest.fn(),
  setDefaultAddress: jest.fn(),
}))
jest.mock('@/features/user/public', () => ({ getUserData: jest.fn() }))
jest.mock('@/shared/api/generated/security', () => ({
  refreshToken: jest.fn(),
}))
jest.mock('@/shared/auth/cookies', () => ({
  clearAuthCookies: jest.fn().mockResolvedValue(undefined),
}))
jest.mock('@/shared/utils/apiError', () => ({ toastError: jest.fn() }))
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: jest.fn() }),
}))

const A = '418499f3-d951-40bf-9414-5cb90ab21ecb'
const B = 'ad0ef2b7-816b-4a11-b361-dfcbe705fc96'
const product = (id: string) => ({
  id,
  name: 'test product',
  description: '',
  price: 10,
  quantity: 20,
  active: true,
  productFileUrl: null,
  averageRating: 0,
  reviewsCount: 0,
  brandName: 'test',
  sellerName: 'test',
})
const item = (id: string, quantity = 1) => ({
  id: 'slot-' + id,
  productInfo: product(id),
  productQuantity: quantity,
})
const cart = (items: ReturnType<typeof item>[]) => ({
  id: 'cart',
  userId: 'account',
  createdAt: '',
  closedAt: null,
  items,
  itemsQuantity: items.length,
  productsQuantity: items.reduce((n, i) => n + i.productQuantity, 0),
  itemsTotalPrice: items.reduce((n, i) => n + i.productQuantity * 10, 0),
})
const address = (id: string, isDefault = true) => ({
  id,
  label: id,
  isDefault,
  country: 'Test',
  city: 'Test',
  line: 'Test street',
  postcode: 'TEST',
})

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((finish) => {
    resolve = finish
  })

  return { promise, resolve }
}
const settle = () => new Promise((finish) => setTimeout(finish, 0))

function seedCart(items = [item(A)]) {
  useCartStore.getState().setTempItems(items)
  useCartStore.setState({ status: 'ready' })
}
function seedFav(ids = [A], synced = true) {
  useFavouritesStore.setState({
    favouriteIds: ids,
    favourites: ids.map(product),
    isSync: synced,
    status: 'ready',
  })
}
beforeEach(() => {
  jest.restoreAllMocks()
  jest.resetAllMocks()
  useAuthStore.getState().reset()
  useCartStore.getState().resetCart()
  useFavouritesStore.getState().resetFav()
  useAddressStore.setState({ addresses: [], loading: false, error: null })
})

test('clear includes an uncertain ordinary add even when it never acquired a visible server slot', async () => {
  const owner = '00000000-0000-4000-8000-000000000001'

  useAuthStore
    .getState()
    .setAuthenticated({ id: owner, email: 'a@example.invalid' } as never)
  seedCart([item(A)])
  useCartStore.setState({ isSync: true })
  const key = `iced-sync-operation:${owner}:cart:lost-add`

  localStorage.setItem(
    key,
    JSON.stringify({
      command: {
        operationId: 'lost-add',
        expectedUserId: owner,
        expectedRevision: 0,
        type: 'add',
        payload: { items: [{ productId: B, productQuantity: 1 }] },
      },
      createdAt: 1,
      source: 'tab',
      status: 'unknown',
    }),
  )
  jest.mocked(cartApi.removeCartItem).mockResolvedValueOnce(cart([]))
  try {
    await useCartStore.getState().clearCart()
    expect(cartApi.removeCartItem).toHaveBeenCalledWith(['slot-' + A], [A, B])
  } finally {
    localStorage.removeItem(key)
  }
})

function rejected(message: string) {
  return new SyncRejectedError({
    operationId: 'rejected',
    outcome: 'REJECTED',
    code: 'QUANTITY_LIMIT',
    message,
    conflicts: [],
    appliedRevision: 0,
    snapshot: { userId: 'account', revision: 0, data: {} },
  })
}

test('rejected guest cart is editable separately while normal account writes remain available', async () => {
  useAuthStore
    .getState()
    .setAuthenticated({ email: 'a@example.invalid' } as never)
  seedCart([item(A, 5)])
  useCartStore.setState({ isSync: false })
  jest
    .mocked(cartApi.mergeCarts)
    .mockRejectedValueOnce(rejected('Reduce the guest quantity'))
  jest.mocked(cartApi.fetchCart).mockResolvedValueOnce(cart([item(B)]))
  await useCartStore.getState().syncSession()
  expect(useCartStore.getState().guestConflict?.items).toEqual([
    { productId: A, productQuantity: 5 },
  ])
  expect(useCartStore.getState().itemsIds).toEqual([
    { productId: B, productQuantity: 1 },
  ])
  jest
    .mocked(cartApi.changeCartItemQuantity)
    .mockResolvedValueOnce(cart([item(B, 2)]))
  useCartStore.getState().add(B)
  await settle()
  expect(useCartStore.getState().count).toBe(2)
  useCartStore.getState().editGuestDraft([{ productId: A, productQuantity: 1 }])
  jest
    .mocked(cartApi.mergeCarts)
    .mockResolvedValueOnce(cart([item(A), item(B, 2)]))
  await useCartStore.getState().retryGuestDraft()
  expect(useCartStore.getState().guestConflict).toBeNull()
  expect(useCartStore.getState().count).toBe(3)
  const calls = jest.mocked(cartApi.mergeCarts).mock.calls

  expect(calls[1][2]).not.toBe(calls[0][2])
  expect(calls[1][0].items).toEqual([{ productId: A, productQuantity: 1 }])
})

test('rejected guest favourites can be discarded without removing account favourites', async () => {
  useAuthStore
    .getState()
    .setAuthenticated({ email: 'a@example.invalid' } as never)
  seedFav([A], false)
  jest
    .mocked(favApi.syncFavourites)
    .mockRejectedValueOnce(rejected('Your account is full'))
  jest.mocked(favApi.fetchFavourites).mockResolvedValueOnce([product(B)])
  await useFavouritesStore.getState().syncSession()
  expect(useFavouritesStore.getState().guestConflict?.productIds).toEqual([A])
  jest.mocked(favApi.removeFavourite).mockResolvedValueOnce(undefined)
  await useFavouritesStore.getState().toggleFavourite(B)
  expect(useFavouritesStore.getState().favouriteIds).toEqual([])
  useFavouritesStore.getState().editGuestDraft([])
  expect(useFavouritesStore.getState().guestConflict).toBeNull()
  expect(favApi.removeFavourite).toHaveBeenCalledTimes(1)
})

test('same-account bootstrap retains a rejected guest draft, but another account cannot inherit it', () => {
  const accountEmail = 'a@example.invalid'

  useAuthStore.getState().setAuthenticated({ email: accountEmail } as never)
  useCartStore.setState({
    isSync: true,
    guestConflict: {
      accountEmail,
      items: [{ productId: A, productQuantity: 2 }],
      message: 'Review',
    },
  })
  useFavouritesStore.setState({
    isSync: true,
    guestConflict: { accountEmail, productIds: [A], message: 'Review' },
  })
  useCartStore.getState().resetCart(true)
  useFavouritesStore.getState().resetFav(true)
  expect(useCartStore.getState().guestConflict?.items).toHaveLength(1)
  expect(useFavouritesStore.getState().guestConflict?.productIds).toEqual([A])
  useAuthStore
    .getState()
    .setAuthenticated({ email: 'b@example.invalid' } as never)
  useCartStore.getState().resetCart(true)
  useFavouritesStore.getState().resetFav(true)
  expect(useCartStore.getState().guestConflict).toBeNull()
  expect(useFavouritesStore.getState().guestConflict).toBeNull()
})

jest.mock('@/features/payment/public', () => ({
  hostedCheckoutEnabled: false,
  checkoutTurnstileEnabled: false,
  getCheckoutErrorMessage: jest.fn(),
  getCheckoutUnavailableMessage: jest.fn(),
  createCheckout: jest.fn(),
}))
jest.mock('@/shared/ui/ProductImage', () => ({
  __esModule: true,
  default: () => null,
}))

jest.mock('@/features/user/api', () => ({ editUserProfile: jest.fn() }))
jest.mock('@/features/orders/ordersApi', () => ({ fetchOrders: jest.fn() }))
jest.mock('@/shared/utils/apiError', () => ({
  toastError: jest.fn(),
  useFormErrorHandler: () => ({ errorMessage: '', handleError: jest.fn(), clearError: jest.fn() }),
}))

test('clear waits for an uncertain merge, deletes real server slots and consumes the pending payload', async () => {
  useAuthStore
    .getState()
    .setAuthenticated({ email: 'a@example.invalid' } as never)
  seedCart([{ ...item(A), id: A }])
  useCartStore.setState({ isSync: false })
  jest.mocked(cartApi.mergeCarts).mockRejectedValueOnce(new Error('reply lost'))
  await expect(useCartStore.getState().syncSession()).rejects.toThrow()
  jest.mocked(cartApi.mergeCarts).mockResolvedValueOnce(cart([item(A)]))
  jest.mocked(cartApi.removeCartItem).mockResolvedValueOnce(cart([]))
  await useCartStore.getState().clearCart()
  expect(cartApi.removeCartItem).toHaveBeenCalledWith(['slot-' + A], [A])
  expect(useCartStore.getState().pendingMerge).toBeNull()
  expect(useCartStore.getState().count).toBe(0)
  jest.mocked(cartApi.fetchCart).mockResolvedValueOnce(cart([]))
  await useCartStore.getState().syncSession()
  expect(cartApi.mergeCarts).toHaveBeenCalledTimes(2)
  expect(useCartStore.getState().count).toBe(0)
})

test('an initial merge failure prevents clearing from falsely succeeding', async () => {
  useAuthStore
    .getState()
    .setAuthenticated({ email: 'a@example.invalid' } as never)
  seedCart()
  useCartStore.setState({ isSync: false })
  jest.mocked(cartApi.mergeCarts).mockRejectedValue(new Error('offline'))
  await useCartStore.getState().clearCart()
  expect(useCartStore.getState().count).toBe(1)
  expect(useCartStore.getState().status).toBe('error')
  expect(useCartStore.getState().pendingMerge).not.toBeNull()
  expect(cartApi.removeCartItem).not.toHaveBeenCalled()
})

test('queued quantity changes use server item IDs obtained after merging', async () => {
  useAuthStore
    .getState()
    .setAuthenticated({ email: 'a@example.invalid' } as never)
  seedCart([{ ...item(A), id: A }])
  useCartStore.setState({ isSync: false })
  const response = deferred<ReturnType<typeof cart>>()

  jest.mocked(cartApi.mergeCarts).mockReturnValueOnce(response.promise)
  jest
    .mocked(cartApi.changeCartItemQuantity)
    .mockResolvedValueOnce(cart([item(A, 2)]))
  const merging = useCartStore.getState().syncSession()

  useCartStore.getState().add(A)
  expect(cartApi.changeCartItemQuantity).not.toHaveBeenCalled()
  response.resolve(cart([item(A)]))
  await merging
  await settle()
  expect(cartApi.changeCartItemQuantity).toHaveBeenCalledWith({
    shoppingCartItemId: 'slot-' + A,
    productId: A,
    productQuantityChange: 1,
  })
  expect(useCartStore.getState().count).toBe(2)
})

test('failed favourite removal restores the saved heart without dropping a pending guest payload', async () => {
  useAuthStore
    .getState()
    .setAuthenticated({ email: 'a@example.invalid' } as never)
  seedFav([A], false)
  jest.mocked(favApi.syncFavourites).mockRejectedValueOnce(new Error('offline'))
  await useFavouritesStore.getState().syncSession()
  jest
    .mocked(favApi.syncFavourites)
    .mockResolvedValueOnce({ products: [product(A)] })
  jest
    .mocked(favApi.removeFavourite)
    .mockRejectedValueOnce(new Error('remove failed'))
  await useFavouritesStore.getState().toggleFavourite(A)
  expect(useFavouritesStore.getState().favouriteIds).toEqual([A])
  expect(useFavouritesStore.getState().pendingSync).toBeNull()
  jest.mocked(favApi.fetchFavourites).mockResolvedValueOnce([product(A)])
  await useFavouritesStore.getState().hydrate()
  expect(useFavouritesStore.getState().favouriteIds).toEqual([A])
})

test('clear waits for an earlier cart add and removes the server slot returned by that add', async () => {
  useAuthStore
    .getState()
    .setAuthenticated({ email: 'a@example.invalid' } as never)
  seedCart()
  const reply = deferred<ReturnType<typeof cart>>()

  jest.mocked(cartApi.mergeCarts).mockReturnValueOnce(reply.promise)
  jest.mocked(cartApi.removeCartItem).mockResolvedValueOnce(cart([]))
  useCartStore.getState().add(B)
  const clearing = useCartStore.getState().clearCart()

  expect(cartApi.removeCartItem).not.toHaveBeenCalled()
  reply.resolve(cart([item(A), item(B)]))
  await clearing
  expect(cartApi.removeCartItem).toHaveBeenCalledWith(
    ['slot-' + A, 'slot-' + B],
    [A, B],
  )
  expect(useCartStore.getState().itemsIds).toEqual([])
})

test('clear preserves products added after clear was requested while it waits for an older write', async () => {
  useAuthStore
    .getState()
    .setAuthenticated({ email: 'a@example.invalid' } as never)
  seedCart()
  const reply = deferred<ReturnType<typeof cart>>()

  jest.mocked(cartApi.changeCartItemQuantity).mockReturnValueOnce(reply.promise)
  jest
    .mocked(cartApi.mergeCarts)
    .mockResolvedValueOnce(cart([item(A), item(B)]))
  jest.mocked(cartApi.removeCartItem).mockResolvedValueOnce(cart([item(B)]))
  useCartStore.getState().add(A)
  const clearing = useCartStore.getState().clearCart()

  useCartStore.getState().add(B)
  await settle()
  reply.resolve(cart([item(A, 2), item(B)]))
  await clearing
  expect(cartApi.removeCartItem).toHaveBeenCalledWith(['slot-' + A], [A])
  expect(useCartStore.getState().itemsIds).toEqual([
    { productId: B, productQuantity: 1 },
  ])
})

describe.each(['cart', 'favourites'] as const)(
  '%s lifecycle ownership',
  (resource) => {
    function prepare() {
      useAuthStore
        .getState()
        .setAuthenticated({ email: 'a@example.invalid' } as never)
      if (resource === 'cart') {
        seedCart()
        useCartStore.setState({ isSync: false })
        const response = deferred<ReturnType<typeof cart>>()

        jest.mocked(cartApi.mergeCarts).mockReturnValueOnce(response.promise)

        return {
          sync: () => useCartStore.getState().syncSession(),
          mutate: () => {
            useCartStore.getState().add(B)

            return Promise.resolve()
          },
          finish: () => response.resolve(cart([item(A)])),
          ids: () => useCartStore.getState().itemsIds.map((i) => i.productId),
          writeCalls: () => jest.mocked(cartApi.mergeCarts).mock.calls.length,
          reset: () => useCartStore.getState().resetCart(),
        }
      }
      seedFav([A], false)
      const response = deferred<{ products: ReturnType<typeof product>[] }>()

      jest.mocked(favApi.syncFavourites).mockReturnValueOnce(response.promise)

      return {
        sync: () => useFavouritesStore.getState().syncSession(),
        mutate: () => useFavouritesStore.getState().toggleFavourite(B),
        finish: () => response.resolve({ products: [product(A)] }),
        ids: () => useFavouritesStore.getState().favouriteIds,
        writeCalls: () => jest.mocked(favApi.syncFavourites).mock.calls.length,
        reset: () => useFavouritesStore.getState().resetFav(),
      }
    }

    test.each(['logout', 'switch account', 'logout and return'] as const)(
      'late work is discarded after %s',
      async (transition) => {
        const client = prepare()
        const syncing = client.sync()
        const changing = client.mutate()

        if (transition !== 'switch account') useAuthStore.getState().reset()
        if (transition !== 'logout')
          useAuthStore.getState().setAuthenticated({
            email:
              transition === 'switch account'
                ? 'b@example.invalid'
                : 'a@example.invalid',
          } as never)
        client.reset()
        client.finish()
        await Promise.all([syncing, changing])
        await settle()
        expect(client.ids()).toEqual([])
        expect(client.writeCalls()).toBe(1)
      },
    )

    test('same-account refresh does not invalidate legitimate in-flight sync', async () => {
      const client = prepare()
      const syncing = client.sync()

      useAuthStore.getState().setAuthenticated({
        email: 'a@example.invalid',
        firstName: 'Updated',
      } as never)
      client.finish()
      await syncing
      expect(client.ids()).toEqual([A])
    })

    test('account ownership also rejects late responses before a reset subscription runs', async () => {
      const client = prepare()
      const syncing = client.sync()

      useAuthStore
        .getState()
        .setAuthenticated({ email: 'b@example.invalid' } as never)
      client.finish()
      await syncing
      // The old response may not mark the new account's collection synchronized.
      expect(
        resource === 'cart'
          ? useCartStore.getState().isSync
          : useFavouritesStore.getState().isSync,
      ).toBe(false)
    })
  },
)

test('UI and stores reject writes while authentication is unresolved', async () => {
  useAuthStore.getState().setLoading()
  const view = renderHook(() => useFavoriteProductActions(A))

  expect(view.result.current.isCartPending).toBe(true)
  expect(view.result.current.isPending).toBe(true)
  useCartStore.getState().add(A)
  await useFavouritesStore.getState().toggleFavourite(A)
  expect(useCartStore.getState().itemsIds).toEqual([])
  expect(useFavouritesStore.getState().favouriteIds).toEqual([])
  expect(cartApi.mergeCarts).not.toHaveBeenCalled()
  expect(favApi.syncFavourites).not.toHaveBeenCalled()
})

test('profile updates cannot replace another account even if a caller forgets its request guard', () => {
  useAuthStore
    .getState()
    .setAuthenticated({ email: 'b@example.invalid' } as never)
  useAuthStore.getState().setUserData({ email: 'a@example.invalid' } as never)
  expect(useAuthStore.getState().userData?.email).toBe('b@example.invalid')
  useAuthStore.getState().reset()
  useAuthStore.getState().setUserData({ email: 'b@example.invalid' } as never)
  expect(useAuthStore.getState().userData).toBeNull()
})

test('an open profile form resets for a new account but preserves edits during same-account refresh', () => {
  const userA = {
    email: 'a@example.invalid',
    firstName: 'Alice',
    lastName: 'Person',
    address: {},
  }
  const userB = {
    email: 'b@example.invalid',
    firstName: 'Boris',
    lastName: 'Person',
    address: {},
  }
  const props = (userData: typeof userA) => ({
    userData,
    summary: buildProfileSummary(userData),
    isEditing: true,
    onCancel: jest.fn(),
    onSaveSuccess: jest.fn(),
    onStartEditing: jest.fn(),
    setUserData: useAuthStore.getState().setUserData,
  })

  useAuthStore.getState().setAuthenticated(userA)
  function ProfileEditor() {
    const user = useAuthStore((state) => state.userData)

    return createElement(
      ProfilePersonalDetailsSection,
      props(user as typeof userA),
    )
  }
  const view = render(createElement(ProfileEditor))

  fireEvent.change(view.getByDisplayValue('Alice'), {
    target: { value: 'Manual edit' },
  })
  act(() => useAuthStore.getState().setAuthenticated(userA))
  expect(view.getByDisplayValue('Manual edit')).toBeTruthy()
  act(() => useAuthStore.getState().setAuthenticated(userB))
  expect(view.queryByDisplayValue('Manual edit')).toBeNull()
  expect(view.getByDisplayValue('Boris')).toBeTruthy()
})

test('account scopes survive token refresh but never a logout and sign-in cycle', () => {
  useAuthStore
    .getState()
    .setAuthenticated({ email: 'a@example.invalid' } as never)
  const scope = captureAccountScope()

  useAuthStore
    .getState()
    .setAuthenticated({ email: 'a@example.invalid' } as never)
  expect(scope.isCurrent()).toBe(true)
  useAuthStore.getState().reset()
  useAuthStore
    .getState()
    .setAuthenticated({ email: 'a@example.invalid' } as never)
  expect(scope.isCurrent()).toBe(false)
})

test('refreshing addresses before a create response arrives keeps one copy of the saved address locally', async () => {
  const reply = deferred<ReturnType<typeof address>>()

  jest.mocked(addresses.createAddress).mockReturnValueOnce(reply.promise)
  const creating = useAddressStore.getState().add(address(A))

  // Creation has committed; a subsequent GET sees it before its POST reply arrives.
  jest.mocked(addresses.getAddresses).mockResolvedValueOnce([address(A)])
  await useAddressStore.getState().fetch()
  expect(useAddressStore.getState().addresses).toHaveLength(1)
  reply.resolve(address(A))
  await creating
  expect(useAddressStore.getState().addresses.map((a) => a.id)).toEqual([A])
})

test('orders clear the previous accounts data when the signed-in account changes', async () => {
  useAuthStore
    .getState()
    .setAuthenticated({ email: 'a@example.invalid' } as never)
  jest.mocked(fetchOrders).mockResolvedValueOnce({
    content: [{ id: 'private-order-A' }],
    totalPages: 1,
    totalElements: 1,
    page: 0,
    size: 10,
  } as never)
  jest.mocked(fetchOrders).mockReturnValueOnce(new Promise(() => {}))
  const view = renderHook(() => useOrders(''))

  await waitFor(() => expect(view.result.current.loading).toBe(false))
  act(() =>
    useAuthStore
      .getState()
      .setAuthenticated({ email: 'b@example.invalid' } as never),
  )
  expect(view.result.current.orders).toEqual([])
  expect(fetchOrders).toHaveBeenCalledTimes(2)
})

test('an open profile editor keeps its original revision when background data refreshes', async () => {
  const original = {
    firstName: 'Alice',
    lastName: 'Tester',
    email: 'a@example.invalid',
    address: {},
    profileRevision: 4,
  }

  useAuthStore.getState().setAuthenticated(original)
  const props = { onSuccessEdit: jest.fn(), updateUserData: jest.fn() }

  jest.mocked(editUserProfile).mockResolvedValue(original)
  const view = render(
    createElement(FormProfile, { ...props, initialUserData: original }),
  )

  view.rerender(
    createElement(FormProfile, {
      ...props,
      initialUserData: {
        ...original,
        firstName: 'Remote edit',
        profileRevision: 5,
      },
    }),
  )
  fireEvent.submit(view.container.querySelector('form')!)
  await waitFor(() =>
    expect(editUserProfile).toHaveBeenCalledWith(
      expect.objectContaining({ firstName: 'Alice' }),
      4,
    ),
  )
})

test('profile order count clears the previous accounts total when both accounts are authenticated', async () => {
  useAuthStore
    .getState()
    .setAuthenticated({ email: 'a@example.invalid' } as never)
  jest.mocked(fetchOrders).mockResolvedValueOnce({ totalElements: 12 } as never)
  jest.mocked(fetchOrders).mockReturnValueOnce(new Promise(() => {}))
  const view = renderHook(() =>
    useProfileOrderCount(
      useAuthStore((state) => state.status === 'authenticated'),
    ),
  )

  await waitFor(() => expect(view.result.current).toBe(12))
  act(() =>
    useAuthStore
      .getState()
      .setAuthenticated({ email: 'b@example.invalid' } as never),
  )
  expect(view.result.current).toBeNull()
  expect(fetchOrders).toHaveBeenCalledTimes(2)
})

test('a profile save from an unmounted old account cannot overwrite the newly signed-in user in client state', async () => {
  const userA = {
    id: 'account-a',
    email: 'a@example.invalid',
    firstName: 'Alice',
    lastName: 'Person',
    phoneNumber: '',
    birthDate: null,
    address: {},
  }
  const userB = {
    id: 'account-b',
    email: 'b@example.invalid',
    firstName: 'Boris',
    lastName: 'Person',
    address: {},
  }

  useAuthStore.getState().setAuthenticated(userA as never)
  const reply = deferred<typeof userA>()

  jest.mocked(editUserProfile).mockReturnValueOnce(reply.promise as never)
  const view = render(
    createElement(FormProfile, {
      initialUserData: userA as never,
      updateUserData: useAuthStore.getState().setUserData,
      onSuccessEdit: jest.fn(),
    }),
  )

  fireEvent.submit(view.container.querySelector('form')!)
  await waitFor(() => expect(editUserProfile).toHaveBeenCalledTimes(1))
  act(() => useAuthStore.getState().setAuthenticated(userB as never))
  view.unmount()
  await act(async () => {
    reply.resolve({ ...userA, firstName: 'Updated Alice' })
    await settle()
  })
  expect(useAuthStore.getState().status).toBe('authenticated')
  expect(useAuthStore.getState().userData?.email).toBe('b@example.invalid')
})
