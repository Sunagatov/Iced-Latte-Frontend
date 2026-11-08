import { act, renderHook } from '@testing-library/react'
import { useSessionBootstrap } from './useSessionBootstrap'
import { useAuthStore } from '@/features/auth/store'
import { SESSION_EVENT_KEY } from './sessionEvents'
import { bootstrapClientSession, resetSessionStores } from './session'
import { reviewDraftKey, saveReviewDraft, readReviewDraft } from '@/features/reviews/reviewDrafts'

jest.mock('next/navigation', () => ({ usePathname: () => '/' }))
jest.mock('./resourceUpdates', () => ({ startResourceUpdates: () => jest.fn() }))
jest.mock('./session', () => ({ bootstrapClientSession: jest.fn().mockResolvedValue(undefined), resetSessionStores: jest.fn(), onSessionStoresHydrated: () => jest.fn(), syncSessionStores: jest.fn() }))

it('clears private state and drafts when another tab logs out, and rechecks a new login', () => {
  useAuthStore.getState().setAuthenticated({ id: 'owner', email: 'qa@example.invalid' } as never)
  const key = reviewDraftKey('owner', 'product')

  saveReviewDraft(key, { text: 'Private draft', rating: 4 })
  const { unmount } = renderHook(useSessionBootstrap)

  jest.mocked(bootstrapClientSession).mockClear()
  act(() => window.dispatchEvent(new StorageEvent('storage', { key: SESSION_EVENT_KEY, newValue: JSON.stringify({ type:'logout',nonce:'1' }) })))
  expect(useAuthStore.getState().status).toBe('anonymous')
  expect(useAuthStore.getState().userData).toBeNull()
  expect(resetSessionStores).toHaveBeenCalled()
  expect(readReviewDraft(key)).toEqual({ text: '', rating: 0 })
  act(() => window.dispatchEvent(new StorageEvent('storage', { key: SESSION_EVENT_KEY, newValue: JSON.stringify({ type:'login',nonce:'2' }) })))
  expect(bootstrapClientSession).toHaveBeenCalledTimes(1)
  expect(useAuthStore.getState().status).toBe('loading')
  unmount()
})
