'use client'

import type { ReactNode } from 'react'
import {
  RiHomeLine,
  RiLogoutBoxLine,
  RiMapPinLine,
  RiNotification3Line,
  RiShieldLine,
  RiStarLine,
  RiUserLine,
} from 'react-icons/ri'
import Loader from '@/shared/ui/Loader/Loader'
import type { ProfileSection } from './profileTypes'

type ProfileNavigationProps = {
  activeSection: ProfileSection
  onSelectSection: (section: ProfileSection) => void
}

type ProfileSidebarNavigationProps = ProfileNavigationProps & {
  isLoggingOut: boolean
  onLogout: () => void
}

type NavigationItem = {
  icon: ReactNode
  id: ProfileSection
  label: string
}

const navItems: NavigationItem[] = [
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

function renderLogoutLabel(isLoggingOut: boolean) {
  if (isLoggingOut) {
    return <Loader />
  }

  return (
    <>
      <RiLogoutBoxLine className="h-5 w-5" />
      Log out
    </>
  )
}

export function ProfileNavigation({
  activeSection,
  onSelectSection,
}: Readonly<ProfileNavigationProps>) {
  return (
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
            onClick={() => onSelectSection(item.id)}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ProfileSidebarNavigation({
  activeSection,
  isLoggingOut,
  onLogout,
  onSelectSection,
}: Readonly<ProfileSidebarNavigationProps>) {
  return (
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
            onClick={() => onSelectSection(item.id)}
          >
            {item.icon}
            {item.label}
          </button>
        ))}

        <div className="border-t border-black/5 p-2">
          <button
            className="text-negative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition hover:bg-red-50"
            onClick={onLogout}
          >
            {renderLogoutLabel(isLoggingOut)}
          </button>
        </div>
      </nav>
    </aside>
  )
}
