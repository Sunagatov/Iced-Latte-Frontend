import { redirect } from 'next/navigation'
import { getCookie } from '@/shared/utils/cookieUtils'

const RestrictRoute = async ({ children }: { children: React.ReactNode }) => {
  const token = await getCookie()

  if (token) redirect('/')

  return <>{children}</>
}

export default RestrictRoute
