import { AxiosError } from 'axios'
import { useAuthStore } from '@/features/auth/store'
import { useFavouritesStore } from '@/features/favorites/state/favoritesStore'
import { editUserProfile } from '@/features/user/api'
import {
  getSyncOperation,
  executeSyncOperation,
  readSyncResource,
  type SyncResult,
} from '@/shared/api/generated/sync'

jest.mock('@/shared/api/generated/sync', () => ({
  getSyncOperation: jest.fn(),
  executeSyncOperation: jest.fn(),
  readSyncResource: jest.fn(),
}))
jest.mock('@/shared/api/generated/user', () => ({ getUserProfile: jest.fn() }))
jest.mock('@/shared/utils/apiError', () => ({ toastError: jest.fn() }))

const A = '418499f3-d951-40bf-9414-5cb90ab21ecb'
const product = {
  id: A,
  name: 'Audit coffee',
  price: 10,
  active: true,
  quantity: 100,
  description: '',
  productFileUrl: null,
  brandName: 'Audit',
  sellerName: 'Local',
  averageRating: 0,
  reviewsCount: 0,
}
let serial = 0
let owner: string

beforeEach(() => {
  jest.resetAllMocks()
  jest.mocked(getSyncOperation).mockRejectedValue(
    new AxiosError('missing', 'ERR_BAD_REQUEST', undefined, undefined, {
      status: 404,
    } as never),
  )
  localStorage.clear()
  useFavouritesStore.getState().resetFav()
  owner = `00000000-0000-4000-8000-${String(++serial).padStart(12, '0')}`
  useAuthStore.getState().setAuthenticated({
    id: owner,
    email: `${owner}@example.invalid`,
    firstName: 'Audit',
    lastName: 'Tester',
    address: {},
    profileRevision: 1,
  })
})

test.each([true, false])(
  'recovered favourite saved=%s uses the current server membership',
  async (initiallySaved) => {
    let saved = initiallySaved
    let revision = 0
    let lose = true
    const receipts = new Map<string, SyncResult>()
    const snapshot = () => ({
      userId: owner,
      revision,
      data: { products: saved ? [product] : [] },
    })

    jest.mocked(readSyncResource).mockImplementation(async () => snapshot())
    jest
      .mocked(executeSyncOperation)
      .mockImplementation(async (_resource, command) => {
        const receipt = receipts.get(command.operationId)

        if (receipt) return { ...receipt, snapshot: snapshot() }
        saved = command.payload.saved as boolean
        revision++
        const result: SyncResult = {
          operationId: command.operationId,
          outcome: 'APPLIED',
          code: 'APPLIED',
          message: 'Saved',
          conflicts: [],
          appliedRevision: revision,
          snapshot: snapshot(),
        }

        receipts.set(command.operationId, result)
        if (lose) {
          lose = false
          throw new Error('response lost after commit')
        }

        return result
      })
    useFavouritesStore.setState({
      favouriteIds: saved ? [A] : [],
      favourites: saved ? [product] : [],
      isSync: true,
      status: 'ready',
    })
    await useFavouritesStore.getState().toggleFavourite(A)
    expect(saved).toBe(!initiallySaved)
    // The first UI rolled back. Another device independently reverses the saved change.
    saved = initiallySaved
    revision++
    await useFavouritesStore.getState().hydrate()
    expect(jest.mocked(executeSyncOperation).mock.calls[1][1].operationId).toBe(
      jest.mocked(executeSyncOperation).mock.calls[0][1].operationId,
    )
    expect(useFavouritesStore.getState().favouriteIds.includes(A)).toBe(saved)
  },
)

test('a rejected profile edit publishes the current server profile for recovery', async () => {
  const current = {
    ...useAuthStore.getState().userData!,
    firstName: 'Remote',
    profileRevision: 2,
  }

  jest
    .mocked(readSyncResource)
    .mockResolvedValue({ userId: owner, revision: 2, data: current })
  jest
    .mocked(executeSyncOperation)
    .mockImplementation(async (_resource, command) => ({
      operationId: command.operationId,
      outcome: 'REJECTED',
      code: 'REVISION_CONFLICT',
      message: 'Review the latest data and try again.',
      conflicts: [],
      appliedRevision: 2,
      snapshot: { userId: owner, revision: 2, data: current },
    }))
  await expect(
    editUserProfile({ firstName: 'Local', lastName: 'Tester' }, 1),
  ).rejects.toMatchObject({ name: 'SyncRejectedError' })
  const reopened = useAuthStore.getState().userData!

  expect(reopened.profileRevision).toBe(2)
  expect(reopened.firstName).toBe('Remote')
  await expect(
    editUserProfile(
      { firstName: 'Local', lastName: 'Tester' },
      reopened.profileRevision,
    ),
  ).rejects.toMatchObject({ name: 'SyncRejectedError' })
  expect(
    jest
      .mocked(executeSyncOperation)
      .mock.calls.map((call) => call[1].expectedRevision),
  ).toEqual([1, 2])
})
