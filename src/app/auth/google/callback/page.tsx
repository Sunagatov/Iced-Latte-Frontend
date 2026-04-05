'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// The backend now sets the token as an HttpOnly cookie and redirects here
// with ?auth=success. No tokens ever appear in the URL.
function GoogleCallbackInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const error = searchParams.get('error')

    if (error) {
      router.replace('/signin?error=google_auth_failed')

      return
    }

    const next = searchParams.get('state')
    const destination =
      next && /^\/[a-zA-Z0-9/_-]*$/.test(next) ? next : '/'

    router.replace(destination)
  }, [searchParams, router])

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
