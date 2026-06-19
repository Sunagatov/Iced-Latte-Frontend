import type { Metadata } from 'next'
import ProfileScreen from '@/features/user/components/profile/ProfileScreen'
import { requireRecoverableSession } from '@/shared/auth/guards'
import { ROUTES } from '@/shared/config/routes'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Profile',
  description: 'Manage your Iced Latte account, addresses, and reviews.',
}

export default async function ProfilePage() {
  await requireRecoverableSession(ROUTES.profile)

  return <ProfileScreen />
}
