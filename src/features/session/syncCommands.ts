import { CanceledError, isAxiosError } from 'axios'
import { useAuthStore } from '@/features/auth/store'
import { captureAccountScope } from '@/features/auth/accountScope'
import {
  executeSyncOperation,
  getSyncOperation,
  readSyncResource,
  type SyncCommand,
  type SyncResult,
  type SyncSnapshot,
} from '@/shared/api/generated/sync'
import { getUserProfile } from '@/shared/api/generated/user'
import type { UserData } from '@/features/user/types'
import {
  acceptSnapshot,
  confirmedSnapshot,
  type Resource,
} from './resourceState'

type Payload = Record<string, unknown>
type Pending = {
  command: SyncCommand
  createdAt: number
  source: string
  status: 'sending' | 'unknown'
}
const prefix = 'iced-sync-operation:'
const queues = new Map<string, Promise<unknown>>()

export class SyncRejectedError extends Error {
  readonly name = 'SyncRejectedError'
  readonly rejected = true
  constructor(readonly result: SyncResult) {
    super(result.message)
  }
}
export class SyncUnknownError extends Error {
  readonly name = 'SyncUnknownError'
  readonly unknown = true
  constructor(readonly operationId: string) {
    super(
      'The save result is not yet known. Retry to check the same change safely.',
    )
  }
}
export const isSyncRejected = (error: unknown): error is SyncRejectedError =>
  error instanceof SyncRejectedError

export function pendingCommands(
  resource: Resource,
): ReadonlyArray<SyncCommand> {
  const state = useAuthStore.getState()

  if (state.status !== 'authenticated' || !state.userData?.id) return []

  return pending(resource, state.userData.id).map((record) => record.command)
}

function actorId(): string {
  const state = useAuthStore.getState()

  if (state.status !== 'authenticated' || !state.userData?.id)
    throw new CanceledError('Confirm your account before saving')

  return state.userData.id
}
function key(resource: Resource, owner: string, id: string) {
  return `${prefix}${owner}:${resource}:${id}`
}
function pending(resource: Resource, owner: string): Pending[] {
  const start = `${prefix}${owner}:${resource}:`
  const records: Pending[] = []

  for (let i = 0; i < localStorage.length; i++) {
    const name = localStorage.key(i)

    if (!name?.startsWith(start)) continue
    try {
      const record = JSON.parse(localStorage.getItem(name)!) as Pending

      if (
        record.command.expectedUserId !== owner ||
        typeof record.command.operationId !== 'string' ||
        typeof record.command.type !== 'string' ||
        !record.command.payload ||
        !Number.isSafeInteger(record.command.expectedRevision) ||
        !Number.isFinite(record.createdAt) ||
        typeof record.source !== 'string'
      )
        throw new Error('Invalid pending save')
      records.push(record)
    } catch {
      throw new Error(
        'A pending save could not be read. Keep this browser data and retry after reloading.',
      )
    }
  }

  return records.sort((a, b) => a.createdAt - b.createdAt)
}
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`
  if (value && typeof value === 'object')
    return `{${Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, item]) => `${JSON.stringify(name)}:${canonical(item)}`)
      .join(',')}}`

  return JSON.stringify(value)
}
function enqueue<T>(
  resource: Resource,
  owner: string,
  work: () => Promise<T>,
): Promise<T> {
  const name = `${owner}:${resource}`
  const previous = queues.get(name) ?? Promise.resolve()
  const promise = previous.catch(() => {}).then(work)

  queues.set(name, promise)
  void promise
    .finally(() => {
      if (queues.get(name) === promise) queues.delete(name)
    })
    .catch(() => {})

  return promise
}
async function send(resource: Resource, record: Pending): Promise<SyncResult> {
  let result: SyncResult

  try {
    result = await executeSyncOperation(resource, record.command, {
      headers: { 'Idempotency-Key': record.command.operationId },
      cache: false,
    } as object)
  } catch (error) {
    localStorage.setItem(
      key(resource, record.command.expectedUserId, record.command.operationId),
      JSON.stringify({ ...record, status: 'unknown' }),
    )
    if (isAxiosError(error) && error.response?.status === 409) {
      await checkAccount(record.command.expectedUserId)
    }
    // Includes timeouts and aborts: neither proves the database rolled back.
    throw new SyncUnknownError(record.command.operationId)
  }
  if (
    result.operationId !== record.command.operationId ||
    !['APPLIED', 'REJECTED'].includes(result.outcome) ||
    !Number.isSafeInteger(result.snapshot?.revision)
  )
    throw new SyncUnknownError(record.command.operationId)
  if (result.snapshot.userId !== record.command.expectedUserId) {
    await checkAccount(record.command.expectedUserId)
    throw new SyncUnknownError(record.command.operationId)
  }
  localStorage.removeItem(
    key(resource, record.command.expectedUserId, record.command.operationId),
  )

  return result
}
async function latest(
  resource: Resource,
  owner: string,
): Promise<SyncSnapshot> {
  const snapshot = await readSyncResource(resource, { cache: false } as object)

  if (snapshot.userId !== owner) {
    await checkAccount(owner)
    throw new CanceledError('Account changed. Refresh your session.')
  }
  if (!Number.isSafeInteger(snapshot.revision) || snapshot.revision < 0)
    throw new Error(
      'The server returned an invalid resource revision. Refresh before saving.',
    )

  return snapshot
}

async function knownOutcome(
  resource: Resource,
  owner: string,
  operationId: string,
): Promise<SyncResult | null> {
  try {
    const result = await getSyncOperation(resource, operationId, {
      cache: false,
    } as object)

    if (
      result.operationId !== operationId ||
      result.snapshot?.userId !== owner ||
      !Number.isSafeInteger(result.snapshot.revision) ||
      result.snapshot.revision < 0 ||
      !['APPLIED', 'REJECTED'].includes(result.outcome)
    )
      throw new SyncUnknownError(operationId)

    return result
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return null
    throw error
  }
}

async function checkAccount(owner: string): Promise<void> {
  const scope = captureAccountScope()
  const user = (await getUserProfile({ cache: false } as object)) as UserData

  if (scope.isCurrent() && user.id !== owner) {
    useAuthStore.getState().setAuthenticated(user)
    throw new CanceledError(
      'Account changed. The previous account’s pending save is retained.',
    )
  }
}

export function readConfirmed<T>(resource: Resource): Promise<T> {
  const owner = actorId()
  const scope = captureAccountScope()

  return enqueue(resource, owner, async () => {
    if (!scope.isCurrent()) throw new CanceledError()
    let rejected: SyncResult | undefined

    for (const record of pending(resource, owner)) {
      const result = await send(resource, record)

      if (!scope.isCurrent()) throw new CanceledError()
      acceptSnapshot(resource, result.snapshot)
      if (result.outcome === 'REJECTED') rejected = result
    }
    const snapshot = await latest(resource, owner)

    if (!scope.isCurrent()) throw new CanceledError()

    const accepted = acceptSnapshot(resource, snapshot)

    if (rejected)
      throw new SyncRejectedError({ ...rejected, snapshot: accepted })

    return accepted.data as T
  })
}

export function executeCommand<T>(
  resource: Resource,
  type: string,
  payload: Payload,
  options: { operationId?: string; expectedRevision?: number } = {},
): Promise<T> {
  const owner = actorId()
  const scope = captureAccountScope()
  const intentId = options.operationId ?? crypto.randomUUID()
  const intent = JSON.parse(JSON.stringify(payload)) as Payload
  const { operationId, expectedRevision } = options

  return enqueue(resource, owner, async () => {
    if (!scope.isCurrent()) throw new CanceledError()
    for (const record of pending(resource, owner)) {
      if (
        operationId === record.command.operationId &&
        (record.command.type !== type ||
          canonical(record.command.payload) !== canonical(intent))
      )
        throw new Error(
          'A pending operation cannot be changed. Resolve the original save before editing its draft.',
        )
      const same = intentId === record.command.operationId
      const result = await send(resource, record)

      if (!scope.isCurrent()) throw new CanceledError()
      const accepted = acceptSnapshot(resource, result.snapshot)

      if (result.outcome === 'REJECTED') throw new SyncRejectedError(result)
      if (same) {
        return accepted.data as T
      }
    }
    if (operationId) {
      const previous = await knownOutcome(resource, owner, operationId)

      if (!scope.isCurrent()) throw new CanceledError()
      if (previous) {
        const accepted = acceptSnapshot(resource, previous.snapshot)

        if (previous.outcome === 'REJECTED')
          throw new SyncRejectedError(previous)

        return accepted.data as T
      }
    }
    // A resource read supplies the base revision; it is not used as proof that an
    // earlier uncertain write failed. Those writes are resolved above by ID.
    const current = confirmedSnapshot(resource, owner)
    const incoming = current ?? (await latest(resource, owner))

    if (!scope.isCurrent()) throw new CanceledError()
    const snapshot = current ?? acceptSnapshot(resource, incoming)
    const command: SyncCommand = {
      operationId: intentId,
      expectedUserId: owner,
      expectedRevision: expectedRevision ?? snapshot.revision,
      type,
      payload: intent,
    }
    const record: Pending = {
      command,
      source: 'explicit-operation-v2',
      createdAt: Date.now(),
      status: 'sending',
    }

    // Refuse to dispatch if durability cannot be established.
    localStorage.setItem(
      key(resource, owner, command.operationId),
      JSON.stringify(record),
    )
    const result = await send(resource, record)

    if (!scope.isCurrent()) throw new CanceledError()
    const accepted = acceptSnapshot(resource, result.snapshot)

    if (result.outcome === 'REJECTED') throw new SyncRejectedError(result)

    return accepted.data as T
  })
}

export function retryCommand<T>(
  resource: Resource,
  operationId: string,
): Promise<T> {
  const owner = actorId()
  const record = pending(resource, owner).find(
    (item) => item.command.operationId === operationId,
  )

  if (!record) {
    const scope = captureAccountScope()

    return enqueue(resource, owner, async () => {
      const result = await knownOutcome(resource, owner, operationId)

      if (!scope.isCurrent()) throw new CanceledError()
      if (!result)
        throw new Error(
          'This operation has no saved command or confirmed outcome. Refresh the list before making a new change.',
        )
      const accepted = acceptSnapshot(resource, result.snapshot)

      if (result.outcome === 'REJECTED') throw new SyncRejectedError(result)

      return accepted.data as T
    })
  }

  return executeCommand<T>(
    resource,
    record.command.type,
    record.command.payload,
    { operationId },
  )
}
