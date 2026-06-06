import { act, renderHook } from '@testing-library/react'
import { useTurnstileVerification } from '@/features/auth/hooks/useTurnstileVerification'

jest.mock('@/shared/config/features', () => ({
  FEATURES: {
    turnstile: true,
  },
}))

describe('useTurnstileVerification', () => {
  it('blocks submission until a challenge token exists', () => {
    const { result } = renderHook(() =>
      useTurnstileVerification('Complete verification first.'),
    )

    act(() => {
      expect(result.current.requireVerified()).toBe(false)
    })

    expect(result.current.error).toBe('Complete verification first.')

    act(() => {
      result.current.handleVerify('turnstile-token')
    })

    expect(result.current.error).toBe('')
    expect(result.current.token).toBe('turnstile-token')

    act(() => {
      expect(result.current.requireVerified()).toBe(true)
    })
  })

  it('clears challenge state when reset', () => {
    const { result } = renderHook(() =>
      useTurnstileVerification('Complete verification first.'),
    )

    act(() => {
      result.current.handleVerify('turnstile-token')
      result.current.resetChallenge()
    })

    expect(result.current.error).toBe('')
    expect(result.current.token).toBe('')
  })
})
