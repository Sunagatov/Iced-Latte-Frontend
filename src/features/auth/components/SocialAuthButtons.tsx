'use client'

import { useSearchParams, usePathname } from 'next/navigation'
import { ROUTES } from '@/shared/config/routes'
import { FEATURES } from '@/shared/config/features'
import { getSafeNext } from '@/shared/utils/navigation'

function SocialButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-[#E2E8F0] bg-white text-sm font-medium text-[#1A202C] transition hover:bg-[#F7F8FA] active:scale-[0.98]"
    >
      {icon}
      {label}
    </button>
  )
}

const GoogleIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path
      d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
      fill="#4285F4"
    />
    <path
      d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
      fill="#34A853"
    />
    <path
      d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
      fill="#FBBC05"
    />
    <path
      d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
      fill="#EA4335"
    />
  </svg>
)

export default function SocialAuthButtons({
  mode,
}: {
  mode: 'signin' | 'signup'
}) {
  if (!FEATURES.googleAuth) return null

  const googleLabel =
    mode === 'signin' ? 'Continue with Google' : 'Sign up with Google'
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const handleGoogleAuth = () => {
    const requestedNext = searchParams.get('next')
    const fallbackNext = pathname !== ROUTES.signin && pathname !== ROUTES.signup ? pathname : null
    const next = getSafeNext(requestedNext) ?? getSafeNext(fallbackNext)
    const url = next ? `/api/auth/google?next=${encodeURIComponent(next)}` : '/api/auth/google'

    window.location.assign(url)
  }

  return (
    <div className="flex flex-col gap-3">
      <SocialButton
        icon={GoogleIcon}
        label={googleLabel}
        onClick={handleGoogleAuth}
      />
    </div>
  )
}
