'use client'
import { forwardRef } from 'react'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { FEATURES } from '@/shared/config/features'

interface Props {
  onVerify: (token: string) => void
}

const TurnstileWidget = forwardRef<TurnstileInstance, Props>(
  ({ onVerify }, ref) => {
    if (!FEATURES.turnstile) return null
    return (
      <div className="mt-4">
        <Turnstile
          ref={ref}
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
          onSuccess={onVerify}
          onExpire={() => onVerify('')}
          options={{ refreshExpired: 'auto' }}
        />
      </div>
    )
  },
)

TurnstileWidget.displayName = 'TurnstileWidget'

export default TurnstileWidget
