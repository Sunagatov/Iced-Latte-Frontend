'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { ROUTES } from '@/shared/config/routes'
import type { ProfileSummary } from './profileTypes'

type ProfileOverviewSectionProps = {
  favCount: number
  onOpenAddresses: () => void
  onOpenProfileEditor: () => void
  orderCount: number | null
  summary: ProfileSummary
}

type InfoRowProps = {
  label: string
  value?: string | null
}

type QuickActionProps = {
  desc: string
  href?: string
  icon: ReactNode
  onClick?: () => void
  title: string
}

type StatCardProps = {
  href?: string
  icon: ReactNode
  label: string
  sub: string
  value: string
}

const InfoRow = ({ label, value }: Readonly<InfoRowProps>) => (
  <div className="flex items-center justify-between py-3.5">
    <span className="text-sm text-black/40">{label}</span>
    <span className={`text-sm font-medium ${value ? 'text-black/80' : 'text-black/20'}`}>
      {value || '—'}
    </span>
  </div>
)

const StatCard = ({ href, icon, label, sub, value }: Readonly<StatCardProps>) => {
  const content = (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.06] transition hover:shadow-md">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0F7F4]">
        {icon}
      </div>
      <p className="text-2xl font-bold text-black/80">{value}</p>
      <p className="text-sm font-medium text-black/70">{label}</p>
      <p className="text-xs text-black/30">{sub}</p>
    </div>
  )

  return href ? <Link href={href}>{content}</Link> : <div>{content}</div>
}

const QuickAction = ({
  desc,
  href,
  icon,
  onClick,
  title,
}: Readonly<QuickActionProps>) => {
  const content = (
    <>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F0F7F4]">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-black/80">{title}</p>
        <p className="truncate text-xs text-black/40">{desc}</p>
      </div>
      <svg className="h-5 w-5 shrink-0 text-black/20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
    </>
  )

  const cls =
    'flex w-full items-center gap-3 rounded-xl border border-black/[0.06] p-4 text-left transition hover:border-brand-solid/20 hover:bg-[#F0F7F4]'

  if (href) {
    return (
      <Link className={cls} href={href}>
        {content}
      </Link>
    )
  }

  return (
    <button className={cls} onClick={onClick} type="button">
      {content}
    </button>
  )
}

export default function ProfileOverviewSection({
  favCount,
  onOpenAddresses,
  onOpenProfileEditor,
  orderCount,
  summary,
}: Readonly<ProfileOverviewSectionProps>) {
  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          href={ROUTES.orders}
          icon={<svg className="h-5 w-5 text-brand" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>}
          label="Orders"
          sub="All time"
          value={orderCount !== null ? String(orderCount) : '—'}
        />
        <StatCard
          href={ROUTES.favourites}
          icon={<svg className="h-5 w-5 text-brand" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>}
          label="Favourites"
          sub="Saved items"
          value={String(favCount)}
        />
        <StatCard
          icon={<svg className="h-5 w-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>}
          label="Loyalty points"
          sub="Points collected"
          value="—"
        />
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/[0.06]">
        <h2 className="mb-4 text-sm font-semibold tracking-wide uppercase text-black/30">
          Quick actions
        </h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <QuickAction
            desc="Track and manage your orders"
            href={ROUTES.orders}
            icon={<svg className="h-6 w-6 text-brand" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>}
            title="My Orders"
          />
          <QuickAction
            desc={`${favCount} saved items`}
            href={ROUTES.favourites}
            icon={<svg className="h-6 w-6 text-brand" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>}
            title="Favourites"
          />
          <QuickAction
            desc="Update your personal details"
            icon={<svg className="h-6 w-6 text-brand" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>}
            onClick={onOpenProfileEditor}
            title="Edit Profile"
          />
          <QuickAction
            desc="Manage your saved addresses"
            icon={<svg className="h-6 w-6 text-brand" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>}
            onClick={onOpenAddresses}
            title="Delivery Address"
          />
        </div>
      </div>

      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.06]">
        <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4">
          <h2 className="font-semibold text-black/80">Account summary</h2>
          <button
            className="text-sm font-medium text-brand hover:underline"
            onClick={onOpenProfileEditor}
          >
            Edit
          </button>
        </div>

        <div className="divide-y divide-black/[0.06] px-5">
          <InfoRow
            label="Name"
            value={summary.fullName === 'Your Account' ? null : summary.fullName}
          />
          <InfoRow label="Email" value={summary.email} />
          <InfoRow label="Phone" value={summary.phoneNumber} />
          <InfoRow label="City" value={summary.city} />
        </div>
      </div>
    </>
  )
}
