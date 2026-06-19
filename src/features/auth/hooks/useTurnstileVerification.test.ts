import { act, renderHook } from '@testing-library/react'
import { useTurnstileVerification } from '@/features/auth/hooks/useTurnstileVerification'

describe('useTurnstileVerification', () => {
  it('renders the challenge immediately and blocks submission until verified', () => {
    const { result } = renderHook(() =>
      useTurnstileVerification('Complete verification first.', true),
    )

    expect(result.current.shouldRender).toBe(true)

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
      useTurnstileVerification('Complete verification first.', true),
    )

    act(() => {
      result.current.requireVerified()
      result.current.handleVerify('turnstile-token')
      result.current.resetChallenge()
    })

    expect(result.current.error).toBe('')
    expect(result.current.token).toBe('')
    expect(result.current.shouldRender).toBe(true)
  })

  it('skips verification entirely when the feature is disabled', () => {
    const { result } = renderHook(() =>
      useTurnstileVerification('Complete verification first.', false),
    )

    expect(result.current.shouldRender).toBe(false)

    act(() => {
      expect(result.current.requireVerified()).toBe(true)
    })

    expect(result.current.error).toBe('')
    expect(result.current.token).toBe('')
  })
})
