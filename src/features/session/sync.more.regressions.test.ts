import { act, render, renderHook } from '@testing-library/react'
import { createElement } from 'react'
import { useAuthStore } from '@/features/auth/store'
import { useCartStore } from '@/features/cart/cartStore'
import { useFavouritesStore } from '@/features/favorites/state/favoritesStore'
import { useAddressStore } from '@/features/addresses/store'
import { getUserData } from '@/features/user/public'
import * as cartApi from '@/features/cart/cartApi'
import * as favApi from '@/features/favorites/favoritesApi'
import * as addresses from '@/features/addresses/api'
import * as session from '@/features/session/session'
import { useCheckoutForm } from '@/features/checkout/useCheckoutForm'
import CartPage from '@/features/cart/routes/CartPage'
import { clearAuthCookies } from '@/shared/auth/cookies'
import { refreshToken } from '@/shared/api/generated/security'

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

test('regression: cart writes wait for guest merge before adding another product', async () => {
  useAuthStore
    .getState()
    .setAuthenticated({ email: 'a@example.invalid' } as never)
  seedCart()
  useCartStore.setState({ isSync: false })
  const oldMerge = deferred<ReturnType<typeof cart>>()

  jest
    .mocked(cartApi.mergeCarts)
    .mockReturnValueOnce(oldMerge.promise)
    .mockResolvedValueOnce(cart([item(A), item(B)]))
  const syncing = useCartStore
    .getState()
    .syncSession(undefined, 'authenticated')

  useCartStore.getState().add(B)
  await settle()
  expect(useCartStore.getState().itemsIds.some((i) => i.productId === B)).toBe(
    false,
  )
  oldMerge.resolve(cart([item(A)]))
  await syncing
  await settle()
  expect(useCartStore.getState().itemsIds).toEqual([
    { productId: A, productQuantity: 1 },
    { productId: B, productQuantity: 1 },
  ])
})

test('regression: favourite removals wait for guest merge before sending the deletion', async () => {
  useAuthStore
    .getState()
    .setAuthenticated({ email: 'a@example.invalid' } as never)
  seedFav([A], false)
  const oldMerge = deferred<{ products: ReturnType<typeof product>[] }>()

  jest.mocked(favApi.syncFavourites).mockReturnValueOnce(oldMerge.promise)
  jest.mocked(favApi.removeFavourite).mockResolvedValueOnce(undefined)
  const syncing = useFavouritesStore
    .getState()
    .syncSession(undefined, 'authenticated')

  const removing = useFavouritesStore.getState().toggleFavourite(A)

  expect(favApi.removeFavourite).not.toHaveBeenCalled()
  oldMerge.resolve({ products: [product(A)] })
  await Promise.all([syncing, removing])
  expect(useFavouritesStore.getState().favouriteIds).toEqual([])
})

test('regression: retrying a cart merge after a lost response reuses the persisted merge key', async () => {
  useAuthStore
    .getState()
    .setAuthenticated({ email: 'a@example.invalid' } as never)
  useCartStore.setState({
    itemsIds: [{ productId: A, productQuantity: 2 }],
    isSync: false,
  })
  let serverQuantity = 0
  let requests = 0
  const processed = new Set<string>()

  jest
    .mocked(cartApi.mergeCarts)
    .mockImplementation(async (request, _signal, key) => {
      expect(key).toBeTruthy()
      if (!processed.has(key!)) {
        serverQuantity += request.items[0].productQuantity
        processed.add(key!)
      }
      requests += 1
      if (requests === 1) throw new Error('response lost after server commit')

      return cart([item(A, serverQuantity)])
    })
  await expect(
    useCartStore.getState().syncSession(undefined, 'authenticated'),
  ).rejects.toThrow()
  expect(serverQuantity).toBe(2)
  const pending = useCartStore.getState().pendingMerge

  expect(
    JSON.parse(localStorage.getItem('cart-storage')!).state.pendingMerge,
  ).toEqual(pending)
  useCartStore.getState().resetCart()
  useCartStore.setState({ pendingMerge: pending })
  await useCartStore.getState().syncSession(undefined, 'authenticated')
  expect(serverQuantity).toBe(2)
  expect(useCartStore.getState().count).toBe(2)
  expect(processed.size).toBe(1)
  expect(useCartStore.getState().pendingMerge).toBeNull()
})

test('regression: cart Retry merges unsaved guest products instead of replacing them', async () => {
  useAuthStore
    .getState()
    .setAuthenticated({ email: 'a@example.invalid' } as never)
  seedCart()
  useCartStore.setState({ isSync: false })
  jest
    .mocked(cartApi.mergeCarts)
    .mockRejectedValueOnce(new Error('offline before save'))
  await expect(
    useCartStore.getState().syncSession(undefined, 'authenticated'),
  ).rejects.toThrow()
  jest
    .mocked(cartApi.mergeCarts)
    .mockResolvedValueOnce(cart([item(A), item(B)]))
  useCartStore.getState().retryHydration()
  await settle()
  expect(useCartStore.getState().itemsIds).toEqual([
    { productId: A, productQuantity: 1 },
    { productId: B, productQuantity: 1 },
  ])
  expect(cartApi.mergeCarts).toHaveBeenCalledTimes(2)
})

test('regression: favourites Retry merges unsaved guest products instead of replacing them', async () => {
  useAuthStore
    .getState()
    .setAuthenticated({ email: 'a@example.invalid' } as never)
  seedFav([A], false)
  jest
    .mocked(favApi.syncFavourites)
    .mockRejectedValueOnce(new Error('offline before save'))
  await useFavouritesStore.getState().syncSession(undefined, 'authenticated')
  expect(useFavouritesStore.getState().status).toBe('error')
  jest
    .mocked(favApi.syncFavourites)
    .mockResolvedValueOnce({ products: [product(A), product(B)] })
  await useFavouritesStore.getState().hydrate()
  expect(useFavouritesStore.getState().favouriteIds).toEqual([A, B])
  expect(favApi.syncFavourites).toHaveBeenCalledTimes(2)
})

test('regression: an older address edit response cannot overwrite a newer saved edit', async () => {
  const oldReply = deferred<ReturnType<typeof address>>()
  let serverCity = 'Original city'

  useAddressStore.setState({ addresses: [address(A)] })
  jest
    .mocked(addresses.updateAddress)
    .mockImplementationOnce(() => {
      serverCity = 'Old city'

      return oldReply.promise
    })
    .mockImplementationOnce(async () => {
      serverCity = 'New city'

      return { ...address(A), city: serverCity }
    })
  const first = useAddressStore
    .getState()
    .update(A, { ...address(A), city: 'Old city' })

  await useAddressStore
    .getState()
    .update(A, { ...address(A), city: 'New city' })
  expect(useAddressStore.getState().addresses[0].city).toBe('New city')
  oldReply.resolve({ ...address(A), city: 'Old city' })
  await first
  expect(useAddressStore.getState().addresses[0].city).toBe('New city')
  expect(serverCity).toBe('New city')
})

test('regression: an older default-address response cannot replace the newer default selection', async () => {
  const oldReply = deferred<ReturnType<typeof address>>()
  let serverDefault = ''

  useAddressStore.setState({
    addresses: [address(A, false), address(B, false)],
  })
  jest
    .mocked(addresses.setDefaultAddress)
    .mockImplementationOnce(() => {
      serverDefault = A

      return oldReply.promise
    })
    .mockImplementationOnce(async () => {
      serverDefault = B

      return address(B)
    })
  const first = useAddressStore.getState().setDefault(A)

  await useAddressStore.getState().setDefault(B)
  expect(
    useAddressStore.getState().addresses.find((a) => a.isDefault)?.id,
  ).toBe(B)
  oldReply.resolve(address(A))
  await first
  expect(
    useAddressStore.getState().addresses.find((a) => a.isDefault)?.id,
  ).toBe(B)
  expect(serverDefault).toBe(B)
})

test('regression: an authentication refresh finishing after logout cannot restore the logged-in UI', async () => {
  const reply = deferred<{ email: string }>()

  useAuthStore
    .getState()
    .setAuthenticated({ email: 'a@example.invalid' } as never)
  jest.mocked(getUserData).mockReturnValueOnce(reply.promise as never)
  const refreshing = session.refreshAuthenticatedSession()

  await settle()
  await session.clearClientSession()
  expect(useAuthStore.getState().status).toBe('anonymous')
  reply.resolve({ email: 'a@example.invalid' })
  await expect(refreshing).rejects.toThrow('Session changed')
  expect(useAuthStore.getState().status).toBe('anonymous')
  expect(useAuthStore.getState().userData).toBeNull()
})

test('regression: switching accounts resets checkout to the new customer details', async () => {
  useAuthStore.getState().setAuthenticated({
    email: 'a@example.invalid',
    firstName: 'Customer A',
    lastName: 'Person A',
    phoneNumber: '111',
    address: {
      country: 'A',
      city: 'City A',
      line: 'Street A',
      postcode: 'AAA',
    },
  } as never)
  const view = renderHook(() => useCheckoutForm())

  expect(view.result.current.form.recipientName).toBe('Customer A')
  act(() =>
    useAuthStore.getState().setAuthenticated({
      email: 'b@example.invalid',
      firstName: 'Customer B',
      lastName: 'Person B',
      phoneNumber: '222',
      address: {
        country: 'B',
        city: 'City B',
        line: 'Street B',
        postcode: 'BBB',
      },
    } as never),
  )
  await act(async () => {
    await settle()
  })
  expect(useAuthStore.getState().userData?.email).toBe('b@example.invalid')
  expect(view.result.current.form.recipientName).toBe('Customer B')
  expect(view.result.current.form.line).toBe('Street B')
  view.unmount()
})

test('regression: persisted account cart items stay hidden while authentication is unresolved', async () => {
  seedCart([
    {
      ...item(A),
      productInfo: { ...product(A), name: 'Previous account cart product' },
    },
  ])
  useCartStore.setState({ status: 'idle' })
  useAuthStore.getState().setLoading()
  const view = render(createElement(CartPage))

  expect(view.queryByText('Previous account cart product')).toBeNull()
  expect(useAuthStore.getState().status).toBe('loading')
})

test('simultaneous session sync requests share a single cart merge', async () => {
  useAuthStore
    .getState()
    .setAuthenticated({ email: 'a@example.invalid' } as never)
  seedCart()
  useCartStore.setState({ isSync: false })
  const response = deferred<ReturnType<typeof cart>>()

  jest.mocked(cartApi.mergeCarts).mockReturnValueOnce(response.promise)
  const first = useCartStore.getState().syncSession()
  const second = useCartStore.getState().hydrate()

  expect(cartApi.mergeCarts).toHaveBeenCalledTimes(1)
  response.resolve(cart([item(A)]))
  await Promise.all([first, second])
  expect(useCartStore.getState().pendingMerge).toBeNull()
})

test('failed cart merge retries only the original guest items after another authenticated add', async () => {
  useAuthStore
    .getState()
    .setAuthenticated({ email: 'a@example.invalid' } as never)
  seedCart()
  useCartStore.setState({ isSync: false })
  const response = deferred<ReturnType<typeof cart>>()

  jest
    .mocked(cartApi.mergeCarts)
    .mockReturnValueOnce(response.promise)
    .mockResolvedValueOnce(cart([item(A), item(B)]))
  const first = useCartStore.getState().syncSession()

  useCartStore.getState().add(B)
  await settle()
  const pending = useCartStore.getState().pendingMerge!

  expect(useCartStore.getState().isSync).toBe(false)
  response.resolve(cart([item(A)]))
  await first
  await settle()
  // Model reloading the persisted state while the original response was lost.
  useCartStore.setState({ pendingMerge: pending, status: 'error' })
  jest
    .mocked(cartApi.mergeCarts)
    .mockResolvedValueOnce(cart([item(A), item(B)]))
  await useCartStore.getState().syncSession()
  expect(cartApi.mergeCarts).toHaveBeenLastCalledWith(
    { items: [{ productId: A, productQuantity: 1 }] },
    undefined,
    pending.key,
  )
  expect(useCartStore.getState().count).toBe(2)
})

test('an interrupted owned cart merge survives bootstrap only for the same account', () => {
  useAuthStore
    .getState()
    .setAuthenticated({ email: 'a@example.invalid' } as never)
  seedCart()
  const pendingMerge = {
    key: 'merge-key',
    items: [{ productId: A, productQuantity: 1 }],
    accountEmail: 'a@example.invalid',
  }

  useCartStore.setState({ pendingMerge })
  useCartStore.getState().resetCart(true)
  expect(useCartStore.getState().pendingMerge).toEqual(pendingMerge)
  useAuthStore
    .getState()
    .setAuthenticated({ email: 'b@example.invalid' } as never)
  useCartStore.getState().resetCart(true)
  expect(useCartStore.getState().itemsIds).toEqual([])
  expect(useCartStore.getState().pendingMerge).toBeNull()
})

test('favourite retry reconciles the original guest snapshot before removing a word', async () => {
  useAuthStore
    .getState()
    .setAuthenticated({ email: 'a@example.invalid' } as never)
  seedFav([A, B], false)
  jest.mocked(favApi.syncFavourites).mockRejectedValueOnce(new Error('offline'))
  await useFavouritesStore.getState().syncSession()
  jest.mocked(favApi.removeFavourite).mockResolvedValueOnce(undefined)
  jest
    .mocked(favApi.syncFavourites)
    .mockResolvedValueOnce({ products: [product(A), product(B)] })
  await useFavouritesStore.getState().toggleFavourite(A)
  expect(favApi.syncFavourites).toHaveBeenLastCalledWith(
    { productIds: [A, B] },
    undefined,
    expect.any(String),
  )
  expect(useFavouritesStore.getState().favouriteIds).toEqual([B])
})

test('late bootstrap cannot start a refresh or change errors after logout', async () => {
  const reply = deferred<never>()

  jest.mocked(getUserData).mockReturnValueOnce(reply.promise)
  const bootstrapping = session.bootstrapClientSession()

  await session.clearClientSession()
  reply.resolve({ email: 'old@example.invalid' } as never)
  await bootstrapping
  expect(useAuthStore.getState().status).toBe('anonymous')
  expect(refreshToken).not.toHaveBeenCalled()
  expect(useAuthStore.getState().bootstrapError).toBeNull()
})

test('logout invalidates authentication reads before cookie cleanup finishes', async () => {
  const reply = deferred<never>()
  const cleanup = deferred<void>()

  jest.mocked(getUserData).mockReturnValueOnce(reply.promise)
  jest.mocked(clearAuthCookies).mockReturnValueOnce(cleanup.promise)
  const bootstrapping = session.bootstrapClientSession()
  const logout = session.clearClientSession()

  reply.resolve({ email: 'old@example.invalid' } as never)
  await bootstrapping
  expect(useAuthStore.getState().status).toBe('anonymous')
  cleanup.resolve()
  await logout
})

test('a late bootstrap cannot overwrite a newly signed-in account', async () => {
  const reply = deferred<never>()

  jest.mocked(getUserData).mockReturnValueOnce(reply.promise)
  const bootstrapping = session.bootstrapClientSession()

  useAuthStore
    .getState()
    .setAuthenticated({ email: 'new@example.invalid' } as never)
  reply.resolve({ email: 'old@example.invalid' } as never)
  await bootstrapping
  expect(useAuthStore.getState().userData?.email).toBe('new@example.invalid')
})

test('checkout preserves manual edits for the same account but clears everything on logout', () => {
  useAuthStore
    .getState()
    .setAuthenticated({ email: 'a@example.invalid', firstName: 'A' } as never)
  const view = renderHook(() => useCheckoutForm())

  act(() =>
    view.result.current.updateField('line')({
      target: { value: 'Manual street' },
    } as never),
  )
  act(() =>
    useAuthStore.getState().setAuthenticated({
      email: 'a@example.invalid',
      firstName: 'Updated',
    } as never),
  )
  expect(view.result.current.form.line).toBe('Manual street')
  act(() => view.result.current.setSelectedAddress(address(A)))
  act(() => useAuthStore.getState().reset())
  expect(
    Object.values(view.result.current.form).every((value) => value === ''),
  ).toBe(true)
  expect(view.result.current.selectedAddress).toBeNull()
})

test('editing an address cannot undo a default-address change made while its save was pending', async () => {
  useAddressStore.setState({ addresses: [address(A), address(B, false)] })
  const reply = deferred<ReturnType<typeof address>>()

  jest.mocked(addresses.updateAddress).mockReturnValueOnce(reply.promise)
  jest.mocked(addresses.setDefaultAddress).mockResolvedValueOnce(address(B))
  const editing = useAddressStore.getState().update(A, address(A))

  await useAddressStore.getState().setDefault(B)
  reply.resolve({ ...address(A), city: 'Updated' })
  await editing
  expect(
    useAddressStore.getState().addresses.find((a) => a.isDefault)?.id,
  ).toBe(B)
  expect(
    useAddressStore.getState().addresses.find((a) => a.id === A)?.city,
  ).toBe('Updated')
})
