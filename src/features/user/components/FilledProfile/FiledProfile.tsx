'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/features/auth/store'
import { useFavouritesStore } from '@/features/favorites/store'
import FormProfile from '../FormProfile/FormProfile'
import ImageUpload from '@/shared/components/ImageUpload/ImageUpload'
import AddressManager from '@/features/addresses/components/AddressManager'
import Link from 'next/link'
import { api } from '@/shared/api/client'
import { useLogout } from '@/features/auth/hooks'
import Loader from '@/shared/components/Loader/Loader'
import UserReviews from '@/features/reviews/components/UserReviews/UserReviews'
import {
  RiLogoutBoxLine,
  RiLockPasswordLine,
  RiUserLine,
  RiMapPinLine,
  RiShoppingBagLine,
  RiHeartLine,
  RiHomeLine,
  RiShieldLine,
  RiArrowRightSLine,
  RiCupLine,
  RiStarLine,
  RiNotification3Line,
} from 'react-icons/ri'

type Section = 'overview' | 'profile' | 'addresses' | 'security' | 'notifications' | 'reviews'

const FiledProfile = () => {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<Section>('overview')
  const [isEditing, setIsEditing] = useState(false)
  const { setUserData, userData, isLoggedIn } = useAuthStore()

  const [hydrated, setHydrated] = useState(false)

  useEffect(() => { setHydrated(true) }, [])
  useEffect(() => {
    if (hydrated && !isLoggedIn) router.replace('/signin')
  }, [hydrated, isLoggedIn, router])
  const { isLoading, logout } = useLogout()
  const favCount = useFavouritesStore((s) => s.count)
  const [orderCount, setOrderCount] = useState<number | null>(null)

  useEffect(() => {
    api.get<{ id: string }[]>('/orders')
      .then((res) => setOrderCount(res.data.length))
      .catch(() => { /* non-critical */ })
  }, [])

  const initials = userData
    ? `${userData.firstName?.[0] ?? ''}${userData.lastName?.[0] ?? ''}`.toUpperCase()
    : '?'

  const memberSince = '2024' // placeholder — extend UserData when API supports it

  const navItems: { id: Section; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <RiHomeLine className="h-5 w-5" /> },
    { id: 'profile', label: 'Personal details', icon: <RiUserLine className="h-5 w-5" /> },
    { id: 'addresses', label: 'Addresses', icon: <RiMapPinLine className="h-5 w-5" /> },
    { id: 'security', label: 'Security', icon: <RiShieldLine className="h-5 w-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <RiNotification3Line className="h-5 w-5" /> },
    { id: 'reviews', label: 'My Reviews', icon: <RiStarLine className="h-5 w-5" /> },
  ]

  const handleNavClick = (id: Section) => {
    setActiveSection(id)
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-secondary">
      {/* Profile hero banner */}
      <div className="bg-gradient-to-r from-brand to-brand-solid-hover">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex items-center gap-5">
            <div className="relative h-20 w-20 shrink-0">
              <div className="h-20 w-20 overflow-hidden rounded-full ring-4 ring-white/30">
                <ImageUpload />
              </div>
              {(!userData?.avatarLink || userData.avatarLink === 'default file') && (
                <div className="pointer-events-none absolute inset-0 flex h-20 w-20 items-center justify-center rounded-full bg-brand-solid-hover text-xl font-bold text-white ring-4 ring-white/30">
                  {initials}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-white truncate">
                  {userData?.firstName && userData?.lastName
                    ? `${userData.firstName} ${userData.lastName}`
                    : 'Your Account'}
                </h1>
                <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white">
                  <RiCupLine className="h-3 w-3" /> Member since {memberSince}
                </span>
              </div>
              {userData?.email && (
                <p className="mt-0.5 text-sm text-white/70 truncate">{userData.email}</p>
              )}
            </div>
            <button
              id="logout-btn"
              onClick={logout}
              className="hidden sm:flex shrink-0 items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
            >
              {isLoading ? <Loader /> : (
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

        {/* Mobile nav tabs — outside the flex row so they stack above content */}
        <div className="lg:hidden mb-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeSection === item.id
                    ? 'bg-brand text-white'
                    : 'bg-primary text-secondary ring-1 ring-black/10'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-6">

          {/* Sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            <nav className="sticky top-6 rounded-2xl bg-primary shadow-sm ring-1 ring-black/5 overflow-hidden">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex w-full items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors ${
                    activeSection === item.id
                      ? 'bg-brand-second text-brand border-r-2 border-brand'
                      : 'text-secondary hover:bg-secondary hover:text-primary'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
              <div className="border-t border-black/5 p-2">
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-negative transition hover:bg-red-50"
                >
                  {isLoading ? <Loader /> : (
                    <>
                      <RiLogoutBoxLine className="h-5 w-5" />
                      Log out
                    </>
                  )}
                </button>
              </div>
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0 space-y-4">

            {/* ── OVERVIEW ── */}
            {activeSection === 'overview' && (
              <>
                {/* Stats row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <StatCard
                    icon={<RiShoppingBagLine className="h-5 w-5 text-brand" />}
                    label="Orders"
                    value={orderCount !== null ? String(orderCount) : '—'}
                    sub="All time"
                    href="/orders"
                  />
                  <StatCard
                    icon={<RiHeartLine className="h-5 w-5 text-negative" />}
                    label="Wishlist"
                    value={String(favCount || 0)}
                    sub="Saved items"
                    href="/favourites"
                  />
                  <StatCard
                    icon={<RiStarLine className="h-5 w-5 text-yellow-500" />}
                    label="Loyalty points"
                    value="—"
                    sub="Beans collected"
                  />
                </div>

                {/* Quick actions */}
                <div className="rounded-2xl bg-primary shadow-sm ring-1 ring-black/5 p-5">
                  <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-secondary">
                    Quick actions
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <QuickAction
                      icon={<RiShoppingBagLine className="h-6 w-6 text-brand" />}
                      title="My Orders"
                      desc="Track and manage your orders"
                      href="/orders"
                    />
                    <QuickAction
                      icon={<RiHeartLine className="h-6 w-6 text-negative" />}
                      title="Favourites"
                      desc={`${favCount || 0} saved items`}
                      href="/favourites"
                    />
                    <QuickAction
                      icon={<RiUserLine className="h-6 w-6 text-brand" />}
                      title="Edit Profile"
                      desc="Update your personal details"
                      onClick={() => { setActiveSection('profile'); setIsEditing(true) }}
                    />
                    <QuickAction
                      icon={<RiMapPinLine className="h-6 w-6 text-brand" />}
                      title="Delivery Address"
                      desc="Manage your saved addresses"
                      onClick={() => setActiveSection('addresses')}
                    />
                  </div>
                </div>

                {/* Profile summary */}
                <div className="rounded-2xl bg-primary shadow-sm ring-1 ring-black/5">
                  <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
                    <h2 className="font-semibold text-primary">Account summary</h2>
                    <button
                      onClick={() => { setActiveSection('profile'); setIsEditing(true) }}
                      className="text-sm font-medium text-brand hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="divide-y divide-black/5 px-5">
                    <InfoRow label="Name" value={userData?.firstName && userData?.lastName ? `${userData.firstName} ${userData.lastName}` : undefined} />
                    <InfoRow label="Email" value={userData?.email} />
                    <InfoRow label="Phone" value={userData?.phoneNumber} />
                    <InfoRow label="City" value={userData?.address?.city} />
                  </div>
                </div>
              </>
            )}

            {/* ── PERSONAL DETAILS ── */}
            {activeSection === 'profile' && (
              <div className="rounded-2xl bg-primary shadow-sm ring-1 ring-black/5">
                <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <RiUserLine className="h-5 w-5 text-brand" />
                    <h2 className="font-semibold text-primary">Personal details</h2>
                  </div>
                  {!isEditing && (
                    <button
                      id="edit-btn"
                      onClick={() => setIsEditing(true)}
                      className="rounded-lg bg-brand px-4 py-1.5 text-sm font-medium text-white transition hover:bg-brand-solid-hover"
                    >
                      Edit
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm text-secondary">Update your personal information below.</p>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="rounded-lg px-3 py-1.5 text-sm text-secondary hover:bg-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                    <FormProfile
                      onSuccessEdit={() => setIsEditing(false)}
                      updateUserData={setUserData}
                      initialUserData={userData ?? null}
                    />
                  </div>
                ) : (
                  <div className="divide-y divide-black/5 px-5">
                    <InfoRow label="First name" value={userData?.firstName} />
                    <InfoRow label="Last name" value={userData?.lastName} />
                    <InfoRow label="Date of birth" value={userData?.birthDate} />
                    <InfoRow label="Email" value={userData?.email} />
                    <InfoRow label="Phone" value={userData?.phoneNumber} />
                  </div>
                )}
              </div>
            )}

            {/* ── ADDRESSES ── */}
            {activeSection === 'addresses' && <AddressManager />}

            {/* ── SECURITY ── */}
            {activeSection === 'security' && (
              <div className="rounded-2xl bg-primary shadow-sm ring-1 ring-black/5">
                <div className="flex items-center gap-2 border-b border-black/5 px-5 py-4">
                  <RiShieldLine className="h-5 w-5 text-brand" />
                  <h2 className="font-semibold text-primary">Security</h2>
                </div>
                <div className="divide-y divide-black/5 px-5">
                  <div className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-sm font-medium text-primary">Password</p>
                      <p className="text-xs text-secondary">Last changed: unknown</p>
                    </div>
                    <Link href="/resetpass">
                      <button
                        id="change-btn"
                        className="flex items-center gap-1.5 rounded-xl border border-black/10 px-4 py-2 text-sm font-medium text-primary transition hover:bg-secondary"
                      >
                        <RiLockPasswordLine className="h-4 w-4" />
                        Change password
                      </button>
                    </Link>
                  </div>
                  <div className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-sm font-medium text-primary">Two-factor authentication</p>
                      <p className="text-xs text-secondary">Add an extra layer of security</p>
                    </div>
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary">
                      Coming soon
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-sm font-medium text-primary">Active sessions</p>
                      <p className="text-xs text-secondary">Manage devices where you&apos;re logged in</p>
                    </div>
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary">
                      Coming soon
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ── REVIEWS ── */}
            {activeSection === 'reviews' && (
              <div className="rounded-2xl bg-primary shadow-sm ring-1 ring-black/5">
                <div className="flex items-center gap-2 border-b border-black/5 px-5 py-4">
                  <RiStarLine className="h-5 w-5 text-brand" />
                  <h2 className="font-semibold text-primary">My Reviews</h2>
                </div>
                <div className="p-5">
                  <UserReviews />
                </div>
              </div>
            )}

            {/* ── NOTIFICATIONS ── */}
            {activeSection === 'notifications' && (
              <div className="rounded-2xl bg-primary shadow-sm ring-1 ring-black/5">
                <div className="flex items-center gap-2 border-b border-black/5 px-5 py-4">
                  <RiNotification3Line className="h-5 w-5 text-brand" />
                  <h2 className="font-semibold text-primary">Notification preferences</h2>
                </div>
                <div className="divide-y divide-black/5 px-5">
                  <NotifRow label="Order updates" desc="Shipping and delivery notifications" defaultOn />
                  <NotifRow label="Promotions & deals" desc="Special offers and discounts" />
                  <NotifRow label="New arrivals" desc="Be first to know about new coffees" />
                  <NotifRow label="Account activity" desc="Login alerts and security notices" defaultOn />
                </div>
                <div className="px-5 py-4">
                  <button className="rounded-lg bg-brand px-5 py-2 text-sm font-medium text-white transition hover:bg-brand-solid-hover">
                    Save preferences
                  </button>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  )
}

/* ── Sub-components ── */

const InfoRow = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="flex items-center justify-between py-3.5">
    <span className="text-sm text-secondary">{label}</span>
    <span className={`text-sm font-medium ${value ? 'text-primary' : 'text-disabled'}`}>
      {value || '—'}
    </span>
  </div>
)

const StatCard = ({
  icon, label, value, sub, href,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  href?: string
}) => {
  const inner = (
    <div className="rounded-2xl bg-primary p-4 shadow-sm ring-1 ring-black/5 transition hover:shadow-md">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
        {icon}
      </div>
      <p className="text-2xl font-bold text-primary">{value}</p>
      <p className="text-sm font-medium text-primary">{label}</p>
      <p className="text-xs text-secondary">{sub}</p>
    </div>
  )

  return href ? <Link href={href}>{inner}</Link> : <div>{inner}</div>
}

const QuickAction = ({
  icon, title, desc, href, onClick,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  href?: string
  onClick?: () => void
}) => {
  const inner = (
    <div
      onClick={onClick}
      className="flex cursor-pointer items-center gap-3 rounded-xl border border-black/5 p-4 transition hover:border-brand/30 hover:bg-brand-second"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-primary">{title}</p>
        <p className="text-xs text-secondary truncate">{desc}</p>
      </div>
      <RiArrowRightSLine className="h-5 w-5 shrink-0 text-disabled" />
    </div>
  )

  return href ? <Link href={href}>{inner}</Link> : <>{inner}</>
}

const NotifRow = ({
  label, desc, defaultOn = false,
}: {
  label: string
  desc: string
  defaultOn?: boolean
}) => {
  const [on, setOn] = useState(defaultOn)

  return (
    <div className="flex items-center justify-between py-4">
      <div>
        <p className="text-sm font-medium text-primary">{label}</p>
        <p className="text-xs text-secondary">{desc}</p>
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`relative h-6 w-11 rounded-full transition-colors ${on ? 'bg-brand' : 'bg-tertiary'}`}
        aria-label={`Toggle ${label}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`}
        />
      </button>
    </div>
  )
}

export default FiledProfile
