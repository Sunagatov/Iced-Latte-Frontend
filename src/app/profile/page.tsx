import { redirect } from 'next/navigation'
import { getCookie, getRefreshCookie } from '@/shared/utils/cookieUtils'
import { hasRecoverableSession } from '@/shared/utils/authToken'
import FilledProfile from '@/features/user/components/FilledProfile/FilledProfile'

const ProfilePage = async () => {
  const token: string | undefined = await getCookie()
  const refreshToken: string | undefined = await getRefreshCookie()

  if (!hasRecoverableSession(token, refreshToken))
    redirect('/signin?next=/profile')

  return <FilledProfile />
}

export default ProfilePage
