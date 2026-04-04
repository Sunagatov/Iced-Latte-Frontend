'use client'

import { useEffect, useState, type ReactNode } from 'react'
import type { AxiosCacheInstance } from 'axios-cache-interceptor'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  RiArrowRightSLine,
  RiCupLine,
  RiHeartLine,
  RiHomeLine,
  RiLockPasswordLine,
  RiLogoutBoxLine,
  RiMapPinLine,
  RiNotification3Line,
  RiShieldLine,
  RiShoppingBagLine,
  RiStarLine,
  RiUserLine,
} from 'react-icons/ri'
import AddressManager from '@/features/addresses/components/AddressManager'
import { useLogout } from '@/features/auth/hooks'
import { useAuthStore, type AuthStore } from '@/features/auth/store'
import { useFavouritesStore } from '@/features/favorites/store'
import UserReviews from '@/features/reviews/components/UserReviews/UserReviews'
import ImageUpload from '@/features/user/components/ImageUpload/ImageUpload'
import type { UserData } from '@/features/user/types'
import { api } from '@/shared/api/client'
import Loader from '@/shared/components/Loader/Loader'
import FormProfile from '../FormProfile/FormProfile'

type Section =
  | 'overview'
  | 'profile'
  | 'addresses'
  | 'security'
  | 'notifications'
  | 'reviews'

type LogoutHookResult = {
  isLoading: boolean
  logout: () => Promise<void>
}

type InfoRowProps = {
  label: string
  value?: string | null
}

type StatCardProps = {
  href?: string
  icon: ReactNode
  label: string
  sub: string
  value: string
}

type QuickActionProps = {
  desc: string
  href?: string
  icon: ReactNode
  onClick?: () => void
  title: string
}

type NotifRowProps = {
  defaultOn?: boolean
  desc: string
  label: string
}

const typedApi: AxiosCacheInstance = api

const FilledProfile = () => {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<Section>('overview')
  const [isEditing, setIsEditing] = useState(false)

  const setUserData = useAuthStore(
    (state: AuthStore): AuthStore['setUserData'] => state.setUserData,
  )
  const userData = useAuthStore(
    (state: AuthStore): UserData | null => state.userData,
  )
  const status = useAuthStore(
    (state: AuthStore): AuthStore['status'] => state.status,
  )

  useEffect(() => {
    if (status === 'anonymous') {
      router.replace('/signin')
    }
  }, [router, status])

  const { isLoading, logout }: LogoutHookResult = useLogout()
  const favCount = useFavouritesStore((state) => state.favouriteIds.length)
  const [orderCount, setOrderCount] = useState<number | null>(null)

  useEffect(() => {
    if (status !== 'authenticated') {
      return
    }

    const loadOrderCount = async (): Promise<void> => {
      try {
        const response = await typedApi.get<{ id: string }[]>('/orders')

        setOrderCount(response.data.length)
      } catch {
        // non-critical
      }
    }

    void loadOrderCount()
  }, [status])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (status !== 'authenticated') {
    return null
  }

  const firstName: string | null = userData?.firstName ?? null
  const lastName: string | null = userData?.lastName ?? null
  const email: string | null = userData?.email ?? null
  const phoneNumber: string | null = userData?.phoneNumber ?? null
  const birthDate: string | null = userData?.birthDate ?? null
  const city: string | null = userData?.address?.city ?? null
  const avatarLink: string | null = userData?.avatarLink ?? null

  const fullName =
    firstName && lastName ? `${firstName} ${lastName}` : 'Your Account'
  const initials =
    `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || '?'
  const hasCustomAvatar = Boolean(avatarLink && avatarLink !== 'default file')

  const handleNavClick = (id: Section): void => {
    setActiveSection(id)
    setIsEditing(false)
  }

  const openProfileEditor = (): void => {
    setActiveSection('profile')
    setIsEditing(true)
  }

  const openAddresses = (): void => {
    setActiveSection('addresses')
    setIsEditing(false)
  }

  const startEditing = (): void => {
    setIsEditing(true)
  }

  const stopEditing = (): void => {
    setIsEditing(false)
  }

  return (
    <div className="bg-secondary min-h-screen">
      <div className="from-brand to-brand-solid-hover bg-gradient-to-r">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex items-center gap-5">
            <div className="relative h-20 w-20 shrink-0">
              <div className="h-20 w-20 overflow-hidden rounded-full ring-4 ring-white/30">
                <ImageUpload />
              </div>

              {!hasCustomAvatar && (
                <div className="bg-brand-solid-hover pointer-events-none absolute inset-0 flex h-20 w-20 items-center justify-center rounded-full text-xl font-bold text-white ring-4 ring-white/30">
                  {initials}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-xl font-bold text-white">
                  {fullName}
                </h1>

                {email && (
                  <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white">
                    <RiCupLine className="h-3 w-3" />
                    Member
                  </span>
                )}
              </div>

              {email && (
                <p className="mt-0.5 truncate text-sm text-white/70">{email}</p>
              )}
            </div>

            <button
              className="hidden shrink-0 items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20 sm:flex"
              id="logout-btn"
              onClick={logout}
            >
              {isLoading ? (
                <Loader />
              ) : (
                <>
                  <RiLogoutBoxLine className="h-4 w-4" />
                  Log out
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 lg:hidden">
          <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
            {navItems.map((item) => (
              <button
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeSection === item.id
                    ? 'bg-brand text-white'
                    : 'bg-primary text-secondary ring-1 ring-black/10'
                }`}
                key={item.id}
                onClick={() => handleNavClick(item.id)}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-6">
          <aside className="hidden w-56 shrink-0 lg:block">
            <nav className="bg-primary sticky top-6 overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5">
              {navItems.map((item) => (
                <button
                  className={`flex w-full items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors ${
                    activeSection === item.id
                      ? 'border-brand bg-brand-second text-brand border-r-2'
                      : 'text-secondary hover:bg-secondary hover:text-primary'
                  }`}
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}

              <div className="border-t border-black/5 p-2">
                <button
                  className="text-negative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition hover:bg-red-50"
                  onClick={logout}
                >
                  {isLoading ? (
                    <Loader />
                  ) : (
                    <>
                      <RiLogoutBoxLine className="h-5 w-5" />
                      Log out
                    </>
                  )}
                </button>
              </div>
            </nav>
          </aside>

          <main className="min-w-0 flex-1 space-y-4">
            {activeSection === 'overview' && (
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
                    value={String(favCount || 0)}
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
                      icon={
                        <RiShoppingBagLine className="text-brand h-6 w-6" />
                      }
                      title="My Orders"
                    />
                    <QuickAction
                      desc={`${favCount || 0} saved items`}
                      href="/favourites"
                      icon={<RiHeartLine className="text-negative h-6 w-6" />}
                      title="Favourites"
                    />
                    <QuickAction
                      desc="Update your personal details"
                      icon={<RiUserLine className="text-brand h-6 w-6" />}
                      onClick={openProfileEditor}
                      title="Edit Profile"
                    />
                    <QuickAction
                      desc="Manage your saved addresses"
                      icon={<RiMapPinLine className="text-brand h-6 w-6" />}
                      onClick={openAddresses}
                      title="Delivery Address"
                    />
                  </div>
                </div>

                <div className="bg-primary rounded-2xl shadow-sm ring-1 ring-black/5">
                  <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
                    <h2 className="text-primary font-semibold">
                      Account summary
                    </h2>
                    <button
                      className="text-brand text-sm font-medium hover:underline"
                      onClick={openProfileEditor}
                    >
                      Edit
                    </button>
                  </div>

                  <div className="divide-y divide-black/5 px-5">
                    <InfoRow
                      label="Name"
                      value={fullName === 'Your Account' ? null : fullName}
                    />
                    <InfoRow label="Email" value={email} />
                    <InfoRow label="Phone" value={phoneNumber} />
                    <InfoRow label="City" value={city} />
                  </div>
                </div>
              </>
            )}

            {activeSection === 'profile' && (
              <div className="bg-primary rounded-2xl shadow-sm ring-1 ring-black/5">
                <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <RiUserLine className="text-brand h-5 w-5" />
                    <h2 className="text-primary font-semibold">
                      Personal details
                    </h2>
                  </div>

                  {!isEditing && (
                    <button
                      className="bg-brand hover:bg-brand-solid-hover rounded-lg px-4 py-1.5 text-sm font-medium text-white transition"
                      id="edit-btn"
                      onClick={startEditing}
                    >
                      Edit
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-secondary text-sm">
                        Update your personal information below.
                      </p>
                      <button
                        className="text-secondary hover:bg-secondary rounded-lg px-3 py-1.5 text-sm"
                        onClick={stopEditing}
                      >
                        Cancel
                      </button>
                    </div>

                    <FormProfile
                      initialUserData={userData ?? null}
                      onSuccessEdit={stopEditing}
                      updateUserData={setUserData}
                    />
                  </div>
                ) : (
                  <div className="divide-y divide-black/5 px-5">
                    <InfoRow label="First name" value={firstName} />
                    <InfoRow label="Last name" value={lastName} />
                    <InfoRow label="Date of birth" value={birthDate} />
                    <InfoRow label="Email" value={email} />
                    <InfoRow label="Phone" value={phoneNumber} />
                  </div>
                )}
              </div>
            )}

            {activeSection === 'addresses' && <AddressManager />}

            {activeSection === 'security' && (
              <div className="bg-primary rounded-2xl shadow-sm ring-1 ring-black/5">
                <div className="flex items-center gap-2 border-b border-black/5 px-5 py-4">
                  <RiShieldLine className="text-brand h-5 w-5" />
                  <h2 className="text-primary font-semibold">Security</h2>
                </div>

                <div className="divide-y divide-black/5 px-5">
                  <div className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-primary text-sm font-medium">
                        Password
                      </p>
                      <p className="text-secondary text-xs">
                        Last changed: unknown
                      </p>
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
                      <p className="text-primary text-sm font-medium">
                        Active sessions
                      </p>
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
            )}

            {activeSection === 'reviews' && (
              <div className="bg-primary rounded-2xl shadow-sm ring-1 ring-black/5">
                <div className="flex items-center gap-2 border-b border-black/5 px-5 py-4">
                  <RiStarLine className="text-brand h-5 w-5" />
                  <h2 className="text-primary font-semibold">My Reviews</h2>
                </div>
                <div className="p-5">
                  <UserReviews />
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="bg-primary rounded-2xl shadow-sm ring-1 ring-black/5">
                <div className="flex items-center gap-2 border-b border-black/5 px-5 py-4">
                  <RiNotification3Line className="text-brand h-5 w-5" />
                  <h2 className="text-primary font-semibold">
                    Notification preferences
                  </h2>
                </div>

                <div className="divide-y divide-black/5 px-5">
                  <NotifRow
                    defaultOn
                    desc="Shipping and delivery notifications"
                    label="Order updates"
                  />
                  <NotifRow
                    desc="Special offers and discounts"
                    label="Promotions & deals"
                  />
                  <NotifRow
                    desc="Be first to know about new coffees"
                    label="New arrivals"
                  />
                  <NotifRow
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
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

const navItems: { icon: ReactNode; id: Section; label: string }[] = [
  {
    icon: <RiHomeLine className="h-5 w-5" />,
    id: 'overview',
    label: 'Overview',
  },
  {
    icon: <RiUserLine className="h-5 w-5" />,
    id: 'profile',
    label: 'Personal details',
  },
  {
    icon: <RiMapPinLine className="h-5 w-5" />,
    id: 'addresses',
    label: 'Addresses',
  },
  {
    icon: <RiShieldLine className="h-5 w-5" />,
    id: 'security',
    label: 'Security',
  },
  {
    icon: <RiNotification3Line className="h-5 w-5" />,
    id: 'notifications',
    label: 'Notifications',
  },
  {
    icon: <RiStarLine className="h-5 w-5" />,
    id: 'reviews',
    label: 'My Reviews',
  },
]

const InfoRow = ({ label, value }: InfoRowProps) => (
  <div className="flex items-center justify-between py-3.5">
    <span className="text-secondary text-sm">{label}</span>
    <span
      className={`text-sm font-medium ${value ? 'text-primary' : 'text-disabled'}`}
    >
      {value || '—'}
    </span>
  </div>
)

const StatCard = ({ href, icon, label, sub, value }: StatCardProps) => {
  const inner = (
    <div className="bg-primary rounded-2xl p-4 shadow-sm ring-1 ring-black/5 transition hover:shadow-md">
      <div className="bg-secondary mb-3 flex h-10 w-10 items-center justify-center rounded-xl">
        {icon}
      </div>
      <p className="text-primary text-2xl font-bold">{value}</p>
      <p className="text-primary text-sm font-medium">{label}</p>
      <p className="text-secondary text-xs">{sub}</p>
    </div>
  )

  return href ? <Link href={href}>{inner}</Link> : <div>{inner}</div>
}

const quickActionClass =
  'flex w-full items-center gap-3 rounded-xl border border-black/5 p-4 text-left transition hover:border-brand/30 hover:bg-brand-second'

const QuickAction = ({
  desc,
  href,
  icon,
  onClick,
  title,
}: QuickActionProps) => {
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

const NotifRow = ({ defaultOn = false, desc, label }: NotifRowProps) => {
  return (
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
}

export default FilledProfile
