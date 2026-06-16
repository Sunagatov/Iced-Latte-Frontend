'use client'

import { useSearchParams, usePathname } from 'next/navigation'
import type * as React from 'react'
import { FEATURES } from '@/shared/config/features'
import { ROUTES } from '@/shared/config/routes'
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

const GitHubIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.2 11.38.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.05-3.34.73-4.04-1.61-4.04-1.61-.55-1.38-1.33-1.75-1.33-1.75-1.09-.75.08-.74.08-.74 1.2.09 1.84 1.24 1.84 1.24 1.08 1.84 2.82 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.31-5.47-1.34-5.47-5.96 0-1.32.47-2.4 1.24-3.25-.12-.31-.54-1.55.12-3.23 0 0 1.01-.32 3.3 1.24a11.35 11.35 0 0 1 6 0c2.28-1.56 3.29-1.24 3.29-1.24.66 1.68.24 2.92.12 3.23.77.85 1.24 1.93 1.24 3.25 0 4.63-2.81 5.65-5.49 5.95.43.37.82 1.1.82 2.22 0 1.61-.01 2.9-.01 3.29 0 .32.21.7.83.58A12 12 0 0 0 24 12.5C24 5.87 18.63.5 12 .5Z" />
  </svg>
)

export default function SocialAuthButtons({
  mode,
}: {
  mode: 'signin' | 'signup'
}) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const hasSocialAuth = FEATURES.googleAuth || FEATURES.githubAuth

  if (!hasSocialAuth) return null

  const buildAuthUrl = (provider: 'google' | 'github') => {
    const requestedNext = searchParams.get('next')
    const fallbackNext = pathname !== ROUTES.signin && pathname !== ROUTES.signup ? pathname : null
    const next = getSafeNext(requestedNext) ?? getSafeNext(fallbackNext)

    return next
      ? `/api/auth/${provider}?next=${encodeURIComponent(next)}`
      : `/api/auth/${provider}`
  }

  const buttons = [
    FEATURES.googleAuth
      ? {
        key: 'google',
        icon: GoogleIcon,
        label:
          mode === 'signin' ? 'Continue with Google' : 'Sign up with Google',
      }
      : null,
    FEATURES.githubAuth
      ? {
        key: 'github',
        icon: GitHubIcon,
        label:
          mode === 'signin' ? 'Continue with GitHub' : 'Sign up with GitHub',
      }
      : null,
  ].filter(Boolean) as Array<{
    key: 'google' | 'github'
    icon: React.ReactNode
    label: string
  }>

  return (
    <div className="flex flex-col gap-3">
      {buttons.map((button) => (
        <SocialButton
          key={button.key}
          icon={button.icon}
          label={button.label}
          onClick={() => {
            window.location.assign(buildAuthUrl(button.key))
          }}
        />
      ))}
    </div>
  )
}
