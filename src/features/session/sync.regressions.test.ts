import {
  act,
  fireEvent,
  render,
  renderHook,
  waitFor,
} from '@testing-library/react'
import { createElement } from 'react'
import { useAuthStore } from '@/features/auth/store'
import { useCartStore } from '@/features/cart/cartStore'
import { useFavouritesStore } from '@/features/favorites/state/favoritesStore'
import { useAddressStore } from '@/features/addresses/store'
import AddressPicker from '@/features/addresses/components/AddressPicker'
import { getUserData } from '@/features/user/public'
import { clearAuthCookies } from '@/shared/auth/cookies'
import * as cartApi from '@/features/cart/cartApi'
import * as favApi from '@/features/favorites/favoritesApi'
import * as products from '@/features/products/api'
import * as addresses from '@/features/addresses/api'
import * as session from '@/features/session/session'
import { useSessionBootstrap } from '@/features/session/useSessionBootstrap'

jest.mock('@/features/auth/public', () =>
  jest.requireActual('@/features/auth/store'),
)
jest.mock('@/features/session/session', () => {
  const actual = jest.requireActual('@/features/session/session')

  return {
    ...actual,
    bootstrapClientSession: jest.fn(actual.bootstrapClientSession),
    syncSessionStores: jest.fn(actual.syncSessionStores),
  }
})
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
jest.mock('next/navigation', () => ({ usePathname: () => '/' }))

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
  const actual = jest.requireActual('@/features/session/session')

  jest
    .mocked(session.bootstrapClientSession)
    .mockImplementation(actual.bootstrapClientSession)
  jest
    .mocked(session.syncSessionStores)
    .mockImplementation(actual.syncSessionStores)
  useAuthStore.getState().reset()
  useCartStore.getState().resetCart()
  useFavouritesStore.getState().resetFav()
  useAddressStore.setState({ addresses: [], loading: false, error: null })
})

test('ignores a cancelled cart login merge after session reset', async () => {
  const reply = deferred<ReturnType<typeof cart>>()

  jest.mocked(cartApi.mergeCarts).mockReturnValueOnce(reply.promise)
  useCartStore.setState({
    itemsIds: [{ productId: A, productQuantity: 1 }],
    isSync: false,
  })
  const controller = new AbortController()
  const syncing = useCartStore
    .getState()
    .syncSession(controller.signal, 'authenticated')

  controller.abort()
  useCartStore.getState().resetCart()
  reply.resolve(cart([item(A)]))
  await syncing
  expect(useCartStore.getState().itemsIds).toEqual([])
  expect(useCartStore.getState().isSync).toBe(false)
})

test('ignores a cancelled favourites login merge after session reset', async () => {
  const reply = deferred<{ products: ReturnType<typeof product>[] }>()

  jest.mocked(favApi.syncFavourites).mockReturnValueOnce(reply.promise)
  seedFav([A], false)
  const controller = new AbortController()
  const syncing = useFavouritesStore
    .getState()
    .syncSession(controller.signal, 'authenticated')

  controller.abort()
  useFavouritesStore.getState().resetFav()
  reply.resolve({ products: [product(A)] })
  await syncing
  expect(useFavouritesStore.getState().favouriteIds).toEqual([])
})

test('preserves guest favourite removal when an older load finishes', async () => {
  const reply = deferred<ReturnType<typeof product>[]>()

  jest.mocked(products.getProductByIds).mockReturnValueOnce(reply.promise)
  seedFav([A], false)
  const loading = useFavouritesStore.getState().hydrate(undefined, 'anonymous')

  await useFavouritesStore.getState().toggleFavourite(A)
  expect(useFavouritesStore.getState().favouriteIds).toEqual([])
  reply.resolve([product(A)])
  await loading
  expect(useFavouritesStore.getState().favouriteIds).toEqual([])
})

test('keeps a saved cart quantity when an older load finishes', async () => {
  const reply = deferred<ReturnType<typeof cart>>()

  useAuthStore
    .getState()
    .setAuthenticated({ email: 'a@example.invalid' } as never)
  seedCart()
  jest.mocked(cartApi.fetchCart).mockReturnValueOnce(reply.promise)
  jest
    .mocked(cartApi.changeCartItemQuantity)
    .mockResolvedValueOnce(cart([item(A, 2)]))
  const loading = useCartStore.getState().hydrate(undefined, 'authenticated')

  useCartStore.getState().add(A)
  await settle()
  expect(useCartStore.getState().count).toBe(2)
  reply.resolve(cart([item(A, 1)]))
  await loading
  expect(useCartStore.getState().count).toBe(2)
})

test('keeps a saved favourite deletion when an older load finishes', async () => {
  const reply = deferred<ReturnType<typeof product>[]>()

  useAuthStore
    .getState()
    .setAuthenticated({ email: 'a@example.invalid' } as never)
  seedFav()
  jest.mocked(favApi.fetchFavourites).mockReturnValueOnce(reply.promise)
  jest.mocked(favApi.removeFavourite).mockResolvedValueOnce(undefined)
  const loading = useFavouritesStore
    .getState()
    .hydrate(undefined, 'authenticated')

  await useFavouritesStore.getState().toggleFavourite(A)
  expect(useFavouritesStore.getState().favouriteIds).toEqual([])
  reply.resolve([product(A)])
  await loading
  expect(useFavouritesStore.getState().favouriteIds).toEqual([])
})

test('marks the first account favourite as synced and never merges it into another account', async () => {
  useAuthStore
    .getState()
    .setAuthenticated({ email: 'a@example.invalid' } as never)
  jest.mocked(favApi.fetchFavourites).mockResolvedValueOnce([])
  await useFavouritesStore.getState().hydrate(undefined, 'authenticated')
  jest
    .mocked(favApi.syncFavourites)
    .mockResolvedValueOnce({ products: [product(A)] })
  await useFavouritesStore.getState().toggleFavourite(A)
  expect(useFavouritesStore.getState().isSync).toBe(true)
  useAuthStore.getState().setAnonymous()
  await session.syncSessionStores('anonymous')
  expect(useFavouritesStore.getState().favouriteIds).toEqual([])
  expect(useFavouritesStore.getState().isSync).toBe(false)
  useAuthStore
    .getState()
    .setAuthenticated({ email: 'b@example.invalid' } as never)
  jest.mocked(favApi.fetchFavourites).mockResolvedValueOnce([])
  await useFavouritesStore.getState().syncSession(undefined, 'authenticated')
  expect(favApi.syncFavourites).toHaveBeenCalledTimes(1)
})

test('preserves newly added products while clearing the original cart', async () => {
  useAuthStore
    .getState()
    .setAuthenticated({ email: 'a@example.invalid' } as never)
  seedCart()
  const reply = deferred<ReturnType<typeof cart>>()

  jest.mocked(cartApi.removeCartItem).mockReturnValueOnce(reply.promise)
  const clearing = useCartStore.getState().clearCart()

  jest
    .mocked(cartApi.mergeCarts)
    .mockResolvedValueOnce(cart([item(A), item(B)]))
  useCartStore.getState().add(B)
  await settle()
  expect(useCartStore.getState().itemsIds.some((i) => i.productId === B)).toBe(
    true,
  )
  reply.resolve(cart([item(B)]))
  await clearing
  expect(useCartStore.getState().itemsIds).toEqual([
    { productId: B, productQuantity: 1 },
  ])
})

test('keeps a deleted address removed when an older fetch finishes', async () => {
  const reply = deferred<ReturnType<typeof address>[]>()

  useAddressStore.setState({ addresses: [address(A, false)] })
  jest.mocked(addresses.getAddresses).mockReturnValueOnce(reply.promise)
  jest.mocked(addresses.deleteAddress).mockResolvedValueOnce(undefined)
  const loading = useAddressStore.getState().fetch()

  await useAddressStore.getState().remove(A)
  expect(useAddressStore.getState().addresses).toEqual([])
  reply.resolve([address(A, false)])
  await loading
  expect(useAddressStore.getState().addresses).toEqual([])
})

test('clears all private stores on logout', async () => {
  seedCart()
  seedFav()
  useAddressStore.setState({ addresses: [address(A)] })
  await session.clearClientSession()
  expect(useCartStore.getState().itemsIds).toEqual([])
  expect(useFavouritesStore.getState().favouriteIds).toEqual([])
  expect(useAddressStore.getState().addresses).toEqual([])
})

test('blocks stale address selection when the current address fetch fails', async () => {
  useAddressStore.setState({ addresses: [address(A)] })
  useAuthStore
    .getState()
    .setAuthenticated({ email: 'b@example.invalid' } as never)
  jest
    .mocked(addresses.getAddresses)
    .mockRejectedValueOnce(new Error('network unavailable'))
  const onSelect = jest.fn()
  const view = render(
    createElement(AddressPicker, {
      mode: 'saved',
      selected: null,
      onSelect,
      onModeChange: jest.fn(),
    }),
  )

  await waitFor(() => expect(view.getByRole('alert')).toBeTruthy())
  expect(onSelect).toHaveBeenCalledWith(null)
  expect(onSelect).not.toHaveBeenCalledWith(address(A))
  expect(view.queryByText('Test street, Test, TEST, Test')).toBeNull()
  expect(useAddressStore.getState().error).toContain('Failed to load')
})

test('resyncs when the account changes without an auth status change', async () => {
  useAuthStore
    .getState()
    .setAuthenticated({ email: 'a@example.invalid' } as never)
  jest.mocked(session.bootstrapClientSession).mockResolvedValue(undefined)
  const sync = jest
    .mocked(session.syncSessionStores)
    .mockResolvedValue(undefined)
  const view = renderHook(() => useSessionBootstrap())

  await act(async () => {
    await settle()
  })
  expect(sync).toHaveBeenCalledTimes(1)
  jest
    .mocked(getUserData)
    .mockResolvedValueOnce({ email: 'b@example.invalid' } as never)
  await act(async () => {
    await session.refreshAuthenticatedSession()
  })
  expect(useAuthStore.getState().userData?.email).toBe('b@example.invalid')
  expect(sync).toHaveBeenCalledTimes(2)
  view.unmount()
})

test('a previous account cart reply cannot alter the next account edit of the same product', async () => {
  const oldReply = deferred<ReturnType<typeof cart>>()
  const newReply = deferred<ReturnType<typeof cart>>()

  useAuthStore
    .getState()
    .setAuthenticated({ email: 'a@example.invalid' } as never)
  seedCart()
  jest
    .mocked(cartApi.changeCartItemQuantity)
    .mockReturnValueOnce(oldReply.promise)
    .mockReturnValueOnce(newReply.promise)
  useCartStore.getState().add(A)
  useCartStore.getState().resetCart()
  useAuthStore
    .getState()
    .setAuthenticated({ email: 'b@example.invalid' } as never)
  seedCart([item(A, 5)])
  useCartStore.getState().add(A)
  oldReply.resolve(cart([item(A, 2)]))
  await settle()
  expect(useCartStore.getState().count).toBe(5)
  expect(useCartStore.getState().pendingProductIds.has(A)).toBe(true)
  newReply.resolve(cart([item(A, 6)]))
  await settle()
  expect(useCartStore.getState().count).toBe(6)
  expect(useCartStore.getState().pendingProductIds.has(A)).toBe(false)
})

test('keeps another guest favourite added while an older load is pending', async () => {
  const oldReply = deferred<ReturnType<typeof product>[]>()

  seedFav([A], false)
  jest
    .mocked(products.getProductByIds)
    .mockReturnValueOnce(oldReply.promise)
    .mockResolvedValueOnce([product(A), product(B)])
  const loading = useFavouritesStore.getState().hydrate(undefined, 'anonymous')

  await useFavouritesStore.getState().toggleFavourite(B)
  oldReply.resolve([product(A)])
  await loading
  expect(useFavouritesStore.getState().favouriteIds).toEqual([A, B])
  expect(useFavouritesStore.getState().favourites.map((p) => p.id)).toEqual([
    A,
    B,
  ])
})

test('ignores address fetches and edits that complete after the account was reset', async () => {
  const oldFetch = deferred<ReturnType<typeof address>[]>()
  const oldEdit = deferred<ReturnType<typeof address>>()

  useAddressStore.setState({ addresses: [address(A)] })
  jest.mocked(addresses.getAddresses).mockReturnValueOnce(oldFetch.promise)
  jest.mocked(addresses.updateAddress).mockReturnValueOnce(oldEdit.promise)
  const loading = useAddressStore.getState().fetch()
  const editing = useAddressStore.getState().update(A, address(A))

  useAddressStore.getState().reset()
  useAddressStore.setState({ addresses: [address(B)] })
  oldFetch.resolve([address(A)])
  oldEdit.resolve(address(A))
  await Promise.all([loading, editing])
  expect(useAddressStore.getState().addresses).toEqual([address(B)])
})

test('latest address fetch wins even when an older request fails later', async () => {
  let reject!: (reason: Error) => void

  jest
    .mocked(addresses.getAddresses)
    .mockReturnValueOnce(
      new Promise((_, fail) => {
        reject = fail
      }),
    )
    .mockResolvedValueOnce([address(B)])
  const older = useAddressStore.getState().fetch()

  await useAddressStore.getState().fetch()
  reject(new Error('old failure'))
  await older
  expect(useAddressStore.getState().addresses).toEqual([address(B)])
  expect(useAddressStore.getState().error).toBeNull()
})

test('private stores are cleared even when clearing cookies fails', async () => {
  seedCart()
  seedFav()
  useAddressStore.setState({ addresses: [address(A)] })
  jest
    .mocked(clearAuthCookies)
    .mockRejectedValueOnce(new Error('cookie failure'))
  await expect(session.clearClientSession()).rejects.toThrow('cookie failure')
  expect(useCartStore.getState().itemsIds).toEqual([])
  expect(useFavouritesStore.getState().favouriteIds).toEqual([])
  expect(useAddressStore.getState().addresses).toEqual([])
})

test('sign-in preserves genuine guest choices and invalidates earlier guest loads', async () => {
  const oldGuestLoad = deferred<ReturnType<typeof product>[]>()

  useCartStore.setState({
    itemsIds: [{ productId: A, productQuantity: 1 }],
    isSync: false,
  })
  seedFav([A], false)
  jest
    .mocked(products.getProductByIds)
    .mockReturnValueOnce(oldGuestLoad.promise)
  jest.mocked(cartApi.mergeCarts).mockResolvedValueOnce(cart([item(A)]))
  jest
    .mocked(favApi.syncFavourites)
    .mockResolvedValueOnce({ products: [product(A)] })
  jest.mocked(session.bootstrapClientSession).mockResolvedValue(undefined)
  const view = renderHook(() => useSessionBootstrap())

  await act(async () => {
    await settle()
  })
  await act(async () => {
    useAuthStore
      .getState()
      .setAuthenticated({ email: 'a@example.invalid' } as never)
    await settle()
  })
  await act(async () => {
    oldGuestLoad.resolve([{ ...product(A), price: 99 }])
    await settle()
  })
  expect(useCartStore.getState().itemsIds).toEqual([
    { productId: A, productQuantity: 1 },
  ])
  expect(useCartStore.getState().tempItems[0].productInfo.price).toBe(10)
  expect(useCartStore.getState().isSync).toBe(true)
  expect(useFavouritesStore.getState().favouriteIds).toEqual([A])
  expect(useFavouritesStore.getState().isSync).toBe(true)
  view.unmount()
})

test('a stale cart load still supplies untouched server items without reverting the edited product', async () => {
  const reply = deferred<ReturnType<typeof cart>>()

  useAuthStore
    .getState()
    .setAuthenticated({ email: 'a@example.invalid' } as never)
  seedCart()
  jest.mocked(cartApi.fetchCart).mockReturnValueOnce(reply.promise)
  jest
    .mocked(cartApi.changeCartItemQuantity)
    .mockResolvedValueOnce(cart([item(A, 2), item(B)]))
  const loading = useCartStore.getState().hydrate(undefined, 'authenticated')

  useCartStore.getState().add(A)
  await settle()
  reply.resolve(cart([item(A), item(B)]))
  await loading
  expect(useCartStore.getState().itemsIds).toEqual([
    { productId: A, productQuantity: 2 },
    { productId: B, productQuantity: 1 },
  ])
  expect(useCartStore.getState().count).toBe(3)
  expect(useCartStore.getState().totalPrice).toBe(30)
})

test('a stale favourite load still supplies untouched server favourites without restoring a removed product', async () => {
  const reply = deferred<ReturnType<typeof product>[]>()

  useAuthStore
    .getState()
    .setAuthenticated({ email: 'a@example.invalid' } as never)
  seedFav()
  jest.mocked(favApi.fetchFavourites).mockReturnValueOnce(reply.promise)
  jest
    .mocked(favApi.removeFavourite)
    .mockResolvedValueOnce({ products: [product(B)] } as never)
  const loading = useFavouritesStore
    .getState()
    .hydrate(undefined, 'authenticated')

  await useFavouritesStore.getState().toggleFavourite(A)
  reply.resolve([product(A), product(B)])
  await loading
  expect(useFavouritesStore.getState().favouriteIds).toEqual([B])
  expect(useFavouritesStore.getState().favourites.map((p) => p.id)).toEqual([B])
})

test('loading favourites during a pending add keeps server items and exits the loading state', async () => {
  const reply = deferred<{ products: ReturnType<typeof product>[] }>()

  useAuthStore
    .getState()
    .setAuthenticated({ email: 'a@example.invalid' } as never)
  seedFav([])
  jest.mocked(favApi.syncFavourites).mockReturnValueOnce(reply.promise)
  const adding = useFavouritesStore.getState().toggleFavourite(A)

  jest.mocked(favApi.fetchFavourites).mockResolvedValueOnce([product(B)])
  await useFavouritesStore.getState().hydrate(undefined, 'authenticated')
  reply.resolve({ products: [product(A), product(B)] })
  await adding
  expect(useFavouritesStore.getState().favouriteIds).toEqual([A, B])
  expect(useFavouritesStore.getState().status).toBe('ready')
})

test('retrying a failed address lookup never displays or selects cached addresses while pending', async () => {
  const reply = deferred<ReturnType<typeof address>[]>()

  useAddressStore.setState({ addresses: [address(A)] })
  useAuthStore
    .getState()
    .setAuthenticated({ email: 'b@example.invalid' } as never)
  jest
    .mocked(addresses.getAddresses)
    .mockRejectedValueOnce(new Error('unavailable'))
    .mockReturnValueOnce(reply.promise)
  const onSelect = jest.fn()
  const view = render(
    createElement(AddressPicker, {
      mode: 'saved',
      selected: null,
      onSelect,
      onModeChange: jest.fn(),
    }),
  )

  await waitFor(() => expect(view.getByRole('alert')).toBeTruthy())
  fireEvent.click(view.getByRole('button', { name: 'Try again' }))
  expect(view.queryByText('Test street, Test, TEST, Test')).toBeNull()
  expect(onSelect).not.toHaveBeenCalledWith(address(A))
  await act(async () => {
    reply.resolve([])
  })
})
