'use client'

import Link from 'next/link'
import UserReviews from '@/features/reviews/components/UserReviews/UserReviews'

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
      <p className="text-sm font-medium text-black/80">{label}</p>
      <p className="text-xs text-black/40">{desc}</p>
    </div>
    <div
      aria-label={`${label} (coming soon)`}
      className={`relative h-6 w-11 cursor-not-allowed rounded-full transition-colors ${
        defaultOn ? 'bg-[#1B4332] opacity-40' : 'bg-black/10 opacity-40'
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
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.06]">
      <div className="flex items-center gap-2 border-b border-black/[0.06] px-5 py-4">
        <svg className="h-5 w-5 text-[#1B4332]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
        <h2 className="font-semibold text-black/80">Security</h2>
      </div>

      <div className="divide-y divide-black/[0.06] px-5">
        <div className="flex items-center justify-between py-4">
          <div>
            <p className="text-sm font-medium text-black/80">Password</p>
            <p className="text-xs text-black/40">Last changed: unknown</p>
          </div>
          <Link
            className="flex items-center gap-1.5 rounded-xl border border-black/[0.08] px-4 py-2 text-sm font-medium text-black/70 transition hover:bg-black/[0.02]"
            href="/resetpass"
            id="change-btn"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
            Change password
          </Link>
        </div>

        <div className="flex items-center justify-between py-4">
          <div>
            <p className="text-sm font-medium text-black/80">
              Two-factor authentication
            </p>
            <p className="text-xs text-black/40">
              Add an extra layer of security
            </p>
          </div>
          <span className="rounded-full bg-black/[0.04] px-3 py-1 text-xs font-medium text-black/30">
            Coming soon
          </span>
        </div>

        <div className="flex items-center justify-between py-4">
          <div>
            <p className="text-sm font-medium text-black/80">Active sessions</p>
            <p className="text-xs text-black/40">
              Manage devices where you&apos;re logged in
            </p>
          </div>
          <span className="rounded-full bg-black/[0.04] px-3 py-1 text-xs font-medium text-black/30">
            Coming soon
          </span>
        </div>
      </div>
    </div>
  )
}

export function ProfileNotificationsSection() {
  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.06]">
      <div className="flex items-center gap-2 border-b border-black/[0.06] px-5 py-4">
        <svg className="h-5 w-5 text-[#1B4332]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
        <h2 className="font-semibold text-black/80">Notification preferences</h2>
      </div>

      <div className="divide-y divide-black/[0.06] px-5">
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
          desc="Be first to know about new products"
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
          className="cursor-not-allowed rounded-lg bg-[#1B4332] px-5 py-2 text-sm font-medium text-white opacity-40"
          disabled
          title="Notification preferences will be saved in a future update"
        >
          Save preferences
        </button>
        <p className="mt-2 text-xs text-black/30">
          Saving preferences coming soon
        </p>
      </div>
    </div>
  )
}

export function ProfileReviewsSection() {
  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.06]">
      <div className="flex items-center gap-2 border-b border-black/[0.06] px-5 py-4">
        <svg className="h-5 w-5 text-[#1B4332]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
        <h2 className="font-semibold text-black/80">My Reviews</h2>
      </div>
      <div className="p-5">
        <UserReviews />
      </div>
    </div>
  )
}
