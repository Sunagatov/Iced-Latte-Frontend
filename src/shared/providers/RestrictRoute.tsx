import { redirect } from 'next/navigation'
import { getCookie } from '@/shared/utils/cookieUtils'
import { isTokenExpired } from '@/shared/utils/authToken'

const RestrictRoute = async ({ children }: { children: React.ReactNode }) => {
  const token = await getCookie()

  if (!token) return <>{children}</>

  if (isTokenExpired(token)) return <>{children}</>

  redirect('/')
}

export default RestrictRoute
