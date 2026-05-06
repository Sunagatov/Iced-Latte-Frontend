import ProfileScreen from '@/features/user/components/profile/ProfileScreen'
import { requireRecoverableSession } from '@/shared/auth/guards'
import { ROUTES } from '@/shared/config/routes'

export default async function ProfilePage() {
  await requireRecoverableSession(ROUTES.profile)

  return <ProfileScreen />
}
