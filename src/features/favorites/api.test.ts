import {
  fetchFavourites,
  syncFavourites,
  removeFavourite,
} from './favoritesApi'
import { executeCommand, readConfirmed } from '@/features/session/syncCommands'

jest.mock('@/features/session/syncCommands', () => ({
  executeCommand: jest.fn(),
  readConfirmed: jest.fn(),
}))

test('loads confirmed favourites through the command gateway', async () => {
  jest.mocked(readConfirmed).mockResolvedValue({ products: [] })
  expect(await fetchFavourites()).toEqual([])
  expect(readConfirmed).toHaveBeenCalledWith('favourites')
})

test('saves explicit membership and keeps the guest merge operation ID', async () => {
  await syncFavourites({ productIds: ['product'] })
  expect(executeCommand).toHaveBeenLastCalledWith(
    'favourites',
    'save',
    { productId: 'product', saved: true },
    { operationId: undefined },
  )
  await removeFavourite('product')
  expect(executeCommand).toHaveBeenLastCalledWith('favourites', 'save', {
    productId: 'product',
    saved: false,
  })
  await syncFavourites(
    { productIds: ['product', 'another'] },
    undefined,
    'merge-id',
  )
  expect(executeCommand).toHaveBeenLastCalledWith(
    'favourites',
    'merge',
    { productIds: ['product', 'another'] },
    { operationId: 'merge-id' },
  )
})
