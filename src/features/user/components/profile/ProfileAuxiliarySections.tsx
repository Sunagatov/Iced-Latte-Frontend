'use client'

import Link from 'next/link'
import {
  RiLockPasswordLine,
  RiNotification3Line,
  RiShieldLine,
  RiStarLine,
} from 'react-icons/ri'
import { UserReviews } from '@/features/reviews/public'

type NotificationPreferenceRowProps = {
  defaultOn?: boolean
  desc: string
  label: string
}

const NotificationPreferenceRow = ({
  defaultOn = false,
  desc,
  label,
}: Readonly<NotificationPreferenceRowProps>) => (
  <div className="flex items-center justify-between py-4">
    <div>
      <p className="text-primary text-sm font-medium">{label}</p>
      <p className="text-secondary text-xs">{desc}</p>
    </div>
    <div
      aria-label={`${label} (coming soon)`}
      className={`relative h-6 w-11 cursor-not-allowed rounded-full transition-colors ${
        defaultOn ? 'bg-brand opacity-40' : 'bg-tertiary opacity-40'
      }`}
      title="Notification preferences coming soon"
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          defaultOn ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </div>
  </div>
)

export function ProfileSecuritySection() {
  return (
    <div className="bg-primary rounded-2xl shadow-sm ring-1 ring-black/5">
      <div className="flex items-center gap-2 border-b border-black/5 px-5 py-4">
        <RiShieldLine className="text-brand h-5 w-5" />
        <h2 className="text-primary font-semibold">Security</h2>
      </div>

      <div className="divide-y divide-black/5 px-5">
        <div className="flex items-center justify-between py-4">
          <div>
            <p className="text-primary text-sm font-medium">Password</p>
            <p className="text-secondary text-xs">Last changed: unknown</p>
          </div>
          <Link
            className="text-primary hover:bg-secondary flex items-center gap-1.5 rounded-xl border border-black/10 px-4 py-2 text-sm font-medium transition"
            href="/resetpass"
            id="change-btn"
          >
            <RiLockPasswordLine className="h-4 w-4" />
            Change password
          </Link>
        </div>

        <div className="flex items-center justify-between py-4">
          <div>
            <p className="text-primary text-sm font-medium">
              Two-factor authentication
            </p>
            <p className="text-secondary text-xs">
              Add an extra layer of security
            </p>
          </div>
          <span className="bg-secondary text-secondary rounded-full px-3 py-1 text-xs font-medium">
            Coming soon
          </span>
        </div>

        <div className="flex items-center justify-between py-4">
          <div>
            <p className="text-primary text-sm font-medium">Active sessions</p>
            <p className="text-secondary text-xs">
              Manage devices where you&apos;re logged in
            </p>
          </div>
          <span className="bg-secondary text-secondary rounded-full px-3 py-1 text-xs font-medium">
            Coming soon
          </span>
        </div>
      </div>
    </div>
  )
}

export function ProfileNotificationsSection() {
  return (
    <div className="bg-primary rounded-2xl shadow-sm ring-1 ring-black/5">
      <div className="flex items-center gap-2 border-b border-black/5 px-5 py-4">
        <RiNotification3Line className="text-brand h-5 w-5" />
        <h2 className="text-primary font-semibold">Notification preferences</h2>
      </div>

      <div className="divide-y divide-black/5 px-5">
        <NotificationPreferenceRow
          defaultOn
          desc="Shipping and delivery notifications"
          label="Order updates"
        />
        <NotificationPreferenceRow
          desc="Special offers and discounts"
          label="Promotions & deals"
        />
        <NotificationPreferenceRow
          desc="Be first to know about new coffees"
          label="New arrivals"
        />
        <NotificationPreferenceRow
          defaultOn
          desc="Login alerts and security notices"
          label="Account activity"
        />
      </div>

      <div className="px-5 py-4">
        <button
          className="bg-brand cursor-not-allowed rounded-lg px-5 py-2 text-sm font-medium text-white opacity-40"
          disabled
          title="Notification preferences will be saved in a future update"
        >
          Save preferences
        </button>
        <p className="text-secondary mt-2 text-xs">
          Saving preferences coming soon
        </p>
      </div>
    </div>
  )
}

export function ProfileReviewsSection() {
  return (
    <div className="bg-primary rounded-2xl shadow-sm ring-1 ring-black/5">
      <div className="flex items-center gap-2 border-b border-black/5 px-5 py-4">
        <RiStarLine className="text-brand h-5 w-5" />
        <h2 className="text-primary font-semibold">My Reviews</h2>
      </div>
      <div className="p-5">
        <UserReviews />
      </div>
    </div>
  )
}
