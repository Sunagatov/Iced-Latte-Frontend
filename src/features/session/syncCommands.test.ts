import { AxiosError } from 'axios'
import { waitFor } from '@testing-library/react'
import { useCartStore } from '@/features/cart/cartStore'
import { useAuthStore } from '@/features/auth/store'
import {
  retryCommand,
  executeCommand,
  readConfirmed,
  SyncUnknownError,
  SyncRejectedError,
} from './syncCommands'
import {
  getSyncOperation,
  executeSyncOperation,
  readSyncResource,
  type SyncCommand,
  type SyncResult,
} from '@/shared/api/generated/sync'
import { getUserProfile } from '@/shared/api/generated/user'
import { confirmedSnapshot } from './resourceState'

jest.mock('@/shared/api/generated/sync', () => ({
  getSyncOperation: jest.fn(),
  executeSyncOperation: jest.fn(),
  readSyncResource: jest.fn(),
}))
jest.mock('@/shared/api/generated/user', () => ({ getUserProfile: jest.fn() }))

let owner: string
let serial = 0
let revision: number
let data: Record<string, unknown>
let receipts: Map<string, SyncResult>
const snapshot = () => ({ userId: owner, revision, data: { ...data } })
const pendingKeys = () =>
  Object.keys(localStorage).filter((key) =>
    key.startsWith('iced-sync-operation:'),
  )

function apply(command: SyncCommand): SyncResult {
  const receipt = receipts.get(command.operationId)

  if (receipt) return { ...receipt, snapshot: snapshot() }
  const rejected =
    command.expectedRevision !== revision || command.type === 'invalid'

  if (!rejected) {
    if (command.type === 'clear') data.quantity = 0
    else
      data.quantity =
        Number(data.quantity) + Number(command.payload.quantity ?? 1)
    revision++
  }
  const result: SyncResult = {
    operationId: command.operationId,
    outcome: rejected ? 'REJECTED' : 'APPLIED',
    code: rejected ? 'REVISION_CONFLICT' : 'APPLIED',
    message: rejected ? 'Review latest data' : 'Saved',
    appliedRevision: revision,
    conflicts: [],
    snapshot: snapshot(),
  }

  receipts.set(command.operationId, result)

  return result
}

beforeEach(() => {
  jest.resetAllMocks()
  jest.mocked(getSyncOperation).mockRejectedValue(
    new AxiosError('missing', 'ERR_BAD_REQUEST', undefined, undefined, {
      status: 404,
    } as never),
  )
  localStorage.clear()
  useCartStore.getState().resetCart()
  owner = `owner-${++serial}`
  revision = 0
  data = { quantity: 0, items: [] }
  receipts = new Map()
  useAuthStore.getState().setAuthenticated({
    id: owner,
    email: `${owner}@example.invalid`,
    firstName: 'Test',
    lastName: 'User',
    address: {},
  })
  jest.mocked(readSyncResource).mockImplementation(async () => snapshot())
  jest
    .mocked(executeSyncOperation)
    .mockImplementation(async (_resource, command) => apply(command))
})

test('actual cart store clears a server-committed new product whose add response was lost', async () => {
  const A = '418499f3-d951-40bf-9414-5cb90ab21ecb'
  const B = 'ad0ef2b7-816b-4a11-b361-dfcbe705fc96'
  const rows = new Map([[A, 1]])
  const cart = () => ({
    id: 'cart',
    userId: owner,
    createdAt: '',
    closedAt: null,
    items: [...rows].map(([id, quantity]) => ({
      id: `slot-${id}`,
      productInfo: { id, name: id, price: 10 },
      productQuantity: quantity,
    })),
    itemsQuantity: rows.size,
    productsQuantity: [...rows.values()].reduce((sum, n) => sum + n, 0),
    itemsTotalPrice: 10 * [...rows.values()].reduce((sum, n) => sum + n, 0),
  })
  const state = () => ({ userId: owner, revision, data: cart() as never })
  const applied = new Map<string, SyncResult>()

  jest.mocked(readSyncResource).mockImplementation(async () => state())
  jest
    .mocked(executeSyncOperation)
    .mockImplementation(async (_resource, command) => {
      const previous = applied.get(command.operationId)

      if (previous) return { ...previous, snapshot: state() }
      if (command.type === 'add') rows.set(B, 1)
      if (command.type === 'clear')
        for (const id of command.payload.productIds as string[]) rows.delete(id)
      revision++
      const result: SyncResult = {
        operationId: command.operationId,
        outcome: 'APPLIED',
        code: 'APPLIED',
        message: 'Saved',
        conflicts: [],
        appliedRevision: revision,
        snapshot: state(),
      }

      applied.set(command.operationId, result)
      if (command.type === 'add') throw new Error('response lost after commit')

      return result
    })
  useCartStore.getState().setTempItems(cart().items as never)
  useCartStore.setState({ status: 'ready' })
  useCartStore.getState().add(B)
  await waitFor(() => expect(useCartStore.getState().status).toBe('error'))
  expect(rows.has(B)).toBe(true)
  expect(
    useCartStore.getState().itemsIds.some((row) => row.productId === B),
  ).toBe(false)
  await useCartStore.getState().clearCart()
  expect(rows.size).toBe(0)
  expect(useCartStore.getState().count).toBe(0)
  const calls = jest.mocked(executeSyncOperation).mock.calls

  expect(calls.map((call) => call[1].type)).toEqual(['add', 'add', 'clear'])
  expect(calls[0][1]).toEqual(calls[1][1])
})

test('a lost response is unknown; retry reuses its exact ID and does not add twice', async () => {
  jest
    .mocked(executeSyncOperation)
    .mockImplementationOnce(async (_resource, command) => {
      apply(command)
      throw new Error('connection lost after commit')
    })
  await expect(
    executeCommand('cart', 'add', { quantity: 1 }),
  ).rejects.toBeInstanceOf(SyncUnknownError)
  const saved = JSON.parse(localStorage.getItem(pendingKeys()[0])!)

  expect(saved.status).toBe('unknown')
  expect(data.quantity).toBe(1)
  expect(await retryCommand('cart', saved.command.operationId)).toMatchObject({
    quantity: 1,
  })
  const calls = jest.mocked(executeSyncOperation).mock.calls

  expect(calls[1][1]).toEqual(calls[0][1])
  expect(pendingKeys()).toEqual([])
})

test('a later clear resolves an uncertain addition before using the confirmed revision', async () => {
  jest
    .mocked(executeSyncOperation)
    .mockImplementationOnce(async (_resource, command) => {
      apply(command)
      throw new Error('lost')
    })
  await expect(executeCommand('cart', 'add', {})).rejects.toBeInstanceOf(
    SyncUnknownError,
  )
  await executeCommand('cart', 'clear', { productIds: ['product'] })
  expect(data.quantity).toBe(0)
  expect(
    jest
      .mocked(executeSyncOperation)
      .mock.calls.map((call) => call[1].expectedRevision),
  ).toEqual([0, 0, 1])
})

test('an independent click after an unknown save creates a new operation even with identical payload', async () => {
  jest
    .mocked(executeSyncOperation)
    .mockImplementationOnce(async (_resource, command) => {
      apply(command)
      throw new Error('lost after commit')
    })
  await expect(executeCommand('cart', 'add', {})).rejects.toBeInstanceOf(
    SyncUnknownError,
  )
  await executeCommand('cart', 'add', {})
  expect(data.quantity).toBe(2)
  const calls = jest.mocked(executeSyncOperation).mock.calls

  expect(calls[0][1].operationId).toBe(calls[1][1].operationId)
  expect(calls[2][1].operationId).not.toBe(calls[0][1].operationId)
})

test('an explicit retry still resolves when another tab already removed its journal record', async () => {
  await executeCommand('cart', 'add', {})
  const original = jest.mocked(executeSyncOperation).mock.calls[0][1]

  revision = 5
  data.quantity = 0
  jest.mocked(getSyncOperation).mockResolvedValue({
    ...receipts.get(original.operationId)!,
    snapshot: snapshot(),
  })
  await expect(
    retryCommand('cart', original.operationId),
  ).resolves.toMatchObject({ quantity: 0 })
  expect(executeSyncOperation).toHaveBeenCalledTimes(1)
})

test('pending operations from a previous tab are recovered before a fresh read', async () => {
  const command = {
    operationId: 'previous-operation',
    expectedUserId: owner,
    expectedRevision: 0,
    type: 'add',
    payload: {},
  }

  apply(command)
  localStorage.setItem(
    `iced-sync-operation:${owner}:cart:${command.operationId}`,
    JSON.stringify({
      command,
      source: 'closed-tab',
      createdAt: 1,
      status: 'unknown',
    }),
  )
  expect(await readConfirmed('cart')).toMatchObject({ quantity: 1 })
  expect(executeSyncOperation).toHaveBeenCalledTimes(1)
  expect(pendingKeys()).toEqual([])
})

test('a definitive rejection leaves the queue usable and a corrected intent gets a new ID', async () => {
  await expect(executeCommand('cart', 'invalid', {})).rejects.toBeInstanceOf(
    SyncRejectedError,
  )
  expect(pendingKeys()).toEqual([])
  await executeCommand('cart', 'add', {})
  expect(data.quantity).toBe(1)
  const calls = jest.mocked(executeSyncOperation).mock.calls

  expect(calls[1][1].operationId).not.toBe(calls[0][1].operationId)
})

test.each(['read', 'write'])(
  'a recovered rejection stays visible during a later %s',
  async (action) => {
    jest
      .mocked(executeSyncOperation)
      .mockImplementationOnce(async (_resource, command) => {
        apply(command)
        throw new Error('rejection response lost')
      })
    await expect(executeCommand('cart', 'invalid', {})).rejects.toBeInstanceOf(
      SyncUnknownError,
    )
    const recovery =
      action === 'read'
        ? readConfirmed('cart')
        : executeCommand('cart', 'add', {})

    await expect(recovery).rejects.toBeInstanceOf(SyncRejectedError)
    expect(pendingKeys()).toEqual([])
    expect(data.quantity).toBe(0)
    await executeCommand('cart', 'add', {})
    expect(data.quantity).toBe(1)
  },
)

test('a read crossing logout and login cannot repopulate the new account lifetime', async () => {
  let finish!: (value: ReturnType<typeof snapshot>) => void

  jest.mocked(readSyncResource).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve
      }),
  )
  const saving = executeCommand('cart', 'add', {})
  const outcome = expect(saving).rejects.toMatchObject({
    name: 'CanceledError',
  })

  while (!finish) await Promise.resolve()
  const user = useAuthStore.getState().userData!

  useAuthStore.getState().reset()
  useAuthStore.getState().setAuthenticated(user)
  finish(snapshot())
  await outcome
  expect(confirmedSnapshot('cart', owner)).toBeUndefined()
  expect(executeSyncOperation).not.toHaveBeenCalled()
})

test('an invalid operation-status snapshot cannot replace confirmed data', async () => {
  jest.mocked(getSyncOperation).mockResolvedValue({
    operationId: 'original',
    outcome: 'APPLIED',
    code: 'APPLIED',
    message: 'Saved',
    conflicts: [],
    appliedRevision: 0,
    snapshot: { ...snapshot(), revision: NaN },
  })
  await expect(retryCommand('cart', 'original')).rejects.toBeInstanceOf(
    SyncUnknownError,
  )
  expect(confirmedSnapshot('cart', owner)).toBeUndefined()
  expect(executeSyncOperation).not.toHaveBeenCalled()
})

test('a stale base is rejected rather than silently overwriting another device', async () => {
  await readConfirmed('cart')
  revision = 2
  data.quantity = 5
  await expect(executeCommand('cart', 'add', {})).rejects.toBeInstanceOf(
    SyncRejectedError,
  )
  expect(data.quantity).toBe(5)
  await executeCommand('cart', 'add', {})
  expect(data.quantity).toBe(6)
})

test('serialises separate clicks, so ordinary repeated additions remain intentional', async () => {
  await Promise.all([
    executeCommand('cart', 'add', {}),
    executeCommand('cart', 'add', {}),
  ])
  expect(data.quantity).toBe(2)
  const calls = jest.mocked(executeSyncOperation).mock.calls

  expect(calls[0][1].operationId).not.toBe(calls[1][1].operationId)
  expect(calls[1][1].expectedRevision).toBe(1)
})

test('refuses to dispatch when browser storage cannot preserve the operation', async () => {
  const failing = jest
    .spyOn(Storage.prototype, 'setItem')
    .mockImplementation(() => {
      throw new Error('quota exceeded')
    })

  try {
    await expect(executeCommand('cart', 'add', {})).rejects.toThrow(
      'quota exceeded',
    )
    expect(executeSyncOperation).not.toHaveBeenCalled()
  } finally {
    failing.mockRestore()
  }
})

test('does not silently discard a damaged pending operation', async () => {
  localStorage.setItem(
    `iced-sync-operation:${owner}:cart:damaged`,
    JSON.stringify({ command: {} }),
  )
  await expect(executeCommand('cart', 'add', {})).rejects.toThrow(
    'pending save could not be read',
  )
  expect(executeSyncOperation).not.toHaveBeenCalled()
  expect(pendingKeys()).toHaveLength(1)
})

test('a changed payload cannot reuse an unresolved operation ID', async () => {
  jest.mocked(executeSyncOperation).mockRejectedValueOnce(new Error('lost'))
  await expect(
    executeCommand('cart', 'merge', { quantity: 1 }, { operationId: 'merge' }),
  ).rejects.toBeInstanceOf(SyncUnknownError)
  await expect(
    executeCommand('cart', 'merge', { quantity: 2 }, { operationId: 'merge' }),
  ).rejects.toThrow('cannot be changed')
  expect(executeSyncOperation).toHaveBeenCalledTimes(1)
})

test('captures immutable wire payloads and matches retries containing optional undefined fields', async () => {
  const payload = { quantity: 1, omitted: undefined }

  jest.mocked(executeSyncOperation).mockRejectedValueOnce(new Error('lost'))
  const saving = executeCommand('profile', 'update', payload)

  payload.quantity = 99
  await expect(saving).rejects.toBeInstanceOf(SyncUnknownError)
  await executeCommand('profile', 'update', { quantity: 1, omitted: undefined })
  const calls = jest.mocked(executeSyncOperation).mock.calls

  expect(calls[0][1].payload).toMatchObject({ quantity: 1 })
  expect(calls[1][1]).toEqual(calls[0][1])
})

test('logout discards queued work, while the already dispatched command can finish under its original owner', async () => {
  let finish!: (result: SyncResult) => void

  jest.mocked(executeSyncOperation).mockImplementationOnce(
    (_resource, command) =>
      new Promise((resolve) => {
        finish = () => resolve(apply(command))
      }),
  )
  const first = executeCommand('cart', 'add', {})
  const second = executeCommand('cart', 'clear', {})
  const outcomes = Promise.allSettled([first, second])

  while (!finish) await Promise.resolve()
  useAuthStore.getState().reset()
  finish({} as SyncResult)
  expect((await outcomes).every((result) => result.status === 'rejected')).toBe(
    true,
  )
  expect(executeSyncOperation).toHaveBeenCalledTimes(1)
})

test('a cookie/account mismatch never exposes the other account snapshot', async () => {
  jest.mocked(readSyncResource).mockResolvedValueOnce({
    ...snapshot(),
    userId: 'other-owner',
    data: { private: 'other account' },
  })
  jest.mocked(getUserProfile).mockResolvedValueOnce({
    id: 'other-owner',
    email: 'other@example.invalid',
    firstName: 'Other',
    lastName: 'User',
  } as never)
  await expect(readConfirmed('cart')).rejects.toMatchObject({
    name: 'CanceledError',
  })
  expect(useAuthStore.getState().userData?.id).toBe('other-owner')
  expect(executeSyncOperation).not.toHaveBeenCalled()
})

test('a write rejected for a different authenticated owner retains the original pending command', async () => {
  jest
    .mocked(executeSyncOperation)
    .mockRejectedValueOnce(
      new AxiosError(
        'owner mismatch',
        'ERR_BAD_REQUEST',
        undefined,
        undefined,
        { status: 409 } as never,
      ),
    )
  jest.mocked(getUserProfile).mockResolvedValueOnce({
    id: 'other-owner',
    email: 'other@example.invalid',
    firstName: 'Other',
    lastName: 'User',
  } as never)
  await expect(executeCommand('cart', 'add', {})).rejects.toMatchObject({
    name: 'CanceledError',
  })
  expect(pendingKeys()).toHaveLength(1)
  expect(
    JSON.parse(localStorage.getItem(pendingKeys()[0])!).command.expectedUserId,
  ).toBe(owner)
})
