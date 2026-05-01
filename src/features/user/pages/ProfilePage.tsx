import { redirect } from 'next/navigation'
import ProfileScreen from '@/features/user/components/profile/ProfileScreen'
import { getCookie, getRefreshCookie } from '@/shared/auth/cookies'
import { hasRecoverableSession } from '@/shared/auth/token'

export default async function ProfilePage() {
  const token = await getCookie()
  const refreshToken = await getRefreshCookie()

  if (!hasRecoverableSession(token, refreshToken)) {
    redirect('/signin?next=/profile')
  }

  return <ProfileScreen />
}
