'use client'

import { useCallback, useRef, useState } from 'react'
import type { TurnstileInstance } from '@marsidev/react-turnstile'
import { FEATURES } from '@/shared/config/features'

export function useTurnstileVerification(requiredMessage: string) {
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const ref = useRef<TurnstileInstance>(null)

  const handleVerify = useCallback((verifiedToken: string) => {
    setToken(verifiedToken)
    setError('')
  }, [])

  const requireVerified = useCallback(() => {
    if (!FEATURES.turnstile || token) {
      return true
    }

    setError(requiredMessage)

    return false
  }, [requiredMessage, token])

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
    token,
  }
}
