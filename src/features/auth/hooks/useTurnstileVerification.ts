'use client'

import { useCallback, useRef, useState } from 'react'
import type { TurnstileInstance } from '@marsidev/react-turnstile'

export function useTurnstileVerification(
  requiredMessage: string,
  enabled: boolean,
) {
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const ref = useRef<TurnstileInstance>(null)

  const handleVerify = useCallback((verifiedToken: string) => {
    setToken(verifiedToken)
    setError('')
  }, [])

  const requireVerified = useCallback(() => {
    if (!enabled || token) {
      return true
    }

    setError(requiredMessage)

    return false
  }, [enabled, requiredMessage, token])

  const resetChallenge = useCallback(() => {
    setToken('')
    setError('')
    ref.current?.reset()
  }, [])

  return {
    error,
    handleVerify,
    ref,
    requireVerified,
    resetChallenge,
    shouldRender: enabled,
    token,
  }
}
