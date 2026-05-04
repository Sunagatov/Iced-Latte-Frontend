'use client'

import type { ReactNode } from 'react'
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
    icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>,
    id: 'overview',
    label: 'Overview',
  },
  {
    icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>,
    id: 'profile',
    label: 'Personal details',
  },
  {
    icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>,
    id: 'addresses',
    label: 'Addresses',
  },
  {
    icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>,
    id: 'security',
    label: 'Security',
  },
  {
    icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>,
    id: 'notifications',
    label: 'Notifications',
  },
  {
    icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>,
    id: 'reviews',
    label: 'My Reviews',
  },
]

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
                ? 'bg-[#1B4332] text-white'
                : 'bg-white text-black/50 ring-1 ring-black/[0.06]'
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
      <nav className="sticky top-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.06]">
        {navItems.map((item) => (
          <button
            className={`flex w-full items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors ${
              activeSection === item.id
                ? 'border-r-2 border-[#1B4332] bg-[#F0F7F4] text-[#1B4332]'
                : 'text-black/40 hover:bg-black/[0.02] hover:text-black/70'
            }`}
            key={item.id}
            onClick={() => onSelectSection(item.id)}
          >
            {item.icon}
            {item.label}
          </button>
        ))}

        <div className="border-t border-black/[0.06] p-2">
          <button
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50"
            onClick={onLogout}
          >
            {isLoggingOut ? (
              <Loader />
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Log out
              </>
            )}
          </button>
        </div>
      </nav>
    </aside>
  )
}
