'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/features/auth/store'
import { setCookie } from '@/shared/utils/cookieUtils'

function GoogleCallbackInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { authenticate, setRefreshToken } = useAuthStore()

  useEffect(() => {
    const token = searchParams.get('token')
    const refreshToken = searchParams.get('refreshToken')
    const error = searchParams.get('error')

    if (error || !token || !refreshToken) {
      router.replace('/signin?error=google_auth_failed')

      return
    }

    authenticate(token)
    setRefreshToken(refreshToken)
    setCookie('token', token)
    router.replace('/')
  }, [searchParams, authenticate, setRefreshToken, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-[#64748B]">Signing you in…</p>
    </div>
  )
}

export default function GoogleCallbackPage() {
  return (
    <Suspense>
      <GoogleCallbackInner />
    </Suspense>
  )
}
