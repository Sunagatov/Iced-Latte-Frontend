import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getCookie, getRefreshCookie } from '@/shared/utils/cookieUtils'
import { hasRecoverableSession } from '@/shared/utils/authToken'

const RestrictRoute = async ({ children }: { children: ReactNode }) => {
  const token = await getCookie()
  const refreshToken = await getRefreshCookie()

  if (!hasRecoverableSession(token, refreshToken)) return <>{children}</>

  redirect('/')
}

export default RestrictRoute
