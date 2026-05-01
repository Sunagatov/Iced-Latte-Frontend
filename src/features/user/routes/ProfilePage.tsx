import FilledProfile from '@/features/user/components/FilledProfile/FilledProfile'
import { getCookie, getRefreshCookie } from '@/shared/auth/cookies'
import { hasRecoverableSession } from '@/shared/auth/token'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const token = await getCookie()
  const refreshToken = await getRefreshCookie()

  if (!hasRecoverableSession(token, refreshToken)) {
    redirect('/signin?next=/profile')
  }

  return <FilledProfile />
}
