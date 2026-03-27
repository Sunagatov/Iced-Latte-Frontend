import { redirect } from 'next/navigation'
import { getCookie, removeCookie } from '@/shared/utils/cookieUtils'
import { isTokenExpired } from '@/shared/utils/authToken'

const RestrictRoute = async ({ children }: { children: React.ReactNode }) => {
  const token = await getCookie()

  if (!token) return <>{children}</>

  if (isTokenExpired(token)) {
    await removeCookie('token')

    return <>{children}</>
  }

  redirect('/')
}

export default RestrictRoute