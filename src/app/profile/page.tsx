import ProfileScreen from '@/features/user/components/profile/ProfileScreen'
import { requireRecoverableSession } from '@/shared/auth/guards'

export default async function ProfilePage() {
  await requireRecoverableSession('/profile')

  return <ProfileScreen />
}
