import { RootLayoutProps } from '@/app/layout'
import { redirect } from 'next/navigation'
import { getCookie } from '@/utils/cookieUtils'

const RestrictRoute = async ({ children }: RootLayoutProps) => {
  const token = await getCookie()

  if (token) {
    redirect('/')
  }

  return <>{children}</>
}

export default RestrictRoute

