import { redirect } from 'next/navigation'
import { getCookie } from '@/shared/utils/cookieUtils'
import { isTokenExpired } from '@/shared/utils/authToken'
import FilledProfile from '@/features/user/components/FilledProfile/FilledProfile'

const ProfilePage = async () => {
  const token = await getCookie()

  if (!token || isTokenExpired(token)) redirect('/signin')

  return <FilledProfile />
}

export default ProfilePage
