'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import {
  RiArrowRightSLine,
  RiHeartLine,
  RiMapPinLine,
  RiShoppingBagLine,
  RiStarLine,
  RiUserLine,
} from 'react-icons/ri'
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

const quickActionClass =
  'flex w-full items-center gap-3 rounded-xl border border-black/5 p-4 text-left transition hover:border-brand/30 hover:bg-brand-second'

const InfoRow = ({ label, value }: Readonly<InfoRowProps>) => (
  <div className="flex items-center justify-between py-3.5">
    <span className="text-secondary text-sm">{label}</span>
    <span
      className={`text-sm font-medium ${value ? 'text-primary' : 'text-disabled'}`}
    >
      {value || '—'}
    </span>
  </div>
)

const StatCard = ({ href, icon, label, sub, value }: Readonly<StatCardProps>) => {
  const content = (
    <div className="bg-primary rounded-2xl p-4 shadow-sm ring-1 ring-black/5 transition hover:shadow-md">
      <div className="bg-secondary mb-3 flex h-10 w-10 items-center justify-center rounded-xl">
        {icon}
      </div>
      <p className="text-primary text-2xl font-bold">{value}</p>
      <p className="text-primary text-sm font-medium">{label}</p>
      <p className="text-secondary text-xs">{sub}</p>
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
      <div className="bg-secondary flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-primary text-sm font-semibold">{title}</p>
        <p className="text-secondary truncate text-xs">{desc}</p>
      </div>
      <RiArrowRightSLine className="text-disabled h-5 w-5 shrink-0" />
    </>
  )

  if (href) {
    return (
      <Link className={quickActionClass} href={href}>
        {content}
      </Link>
    )
  }

  return (
    <button className={quickActionClass} onClick={onClick} type="button">
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
          href="/orders"
          icon={<RiShoppingBagLine className="text-brand h-5 w-5" />}
          label="Orders"
          sub="All time"
          value={orderCount !== null ? String(orderCount) : '—'}
        />
        <StatCard
          href="/favourites"
          icon={<RiHeartLine className="text-negative h-5 w-5" />}
          label="Favourites"
          sub="Saved items"
          value={String(favCount)}
        />
        <StatCard
          icon={<RiStarLine className="h-5 w-5 text-yellow-500" />}
          label="Loyalty points"
          sub="Beans collected"
          value="—"
        />
      </div>

      <div className="bg-primary rounded-2xl p-5 shadow-sm ring-1 ring-black/5">
        <h2 className="text-secondary mb-4 text-sm font-semibold tracking-wide uppercase">
          Quick actions
        </h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <QuickAction
            desc="Track and manage your orders"
            href="/orders"
            icon={<RiShoppingBagLine className="text-brand h-6 w-6" />}
            title="My Orders"
          />
          <QuickAction
            desc={`${favCount} saved items`}
            href="/favourites"
            icon={<RiHeartLine className="text-negative h-6 w-6" />}
            title="Favourites"
          />
          <QuickAction
            desc="Update your personal details"
            icon={<RiUserLine className="text-brand h-6 w-6" />}
            onClick={onOpenProfileEditor}
            title="Edit Profile"
          />
          <QuickAction
            desc="Manage your saved addresses"
            icon={<RiMapPinLine className="text-brand h-6 w-6" />}
            onClick={onOpenAddresses}
            title="Delivery Address"
          />
        </div>
      </div>

      <div className="bg-primary rounded-2xl shadow-sm ring-1 ring-black/5">
        <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
          <h2 className="text-primary font-semibold">Account summary</h2>
          <button
            className="text-brand text-sm font-medium hover:underline"
            onClick={onOpenProfileEditor}
          >
            Edit
          </button>
        </div>

        <div className="divide-y divide-black/5 px-5">
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
