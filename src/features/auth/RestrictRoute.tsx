import type { ReactNode } from 'react'
import { redirectIfAuthenticated } from '@/shared/auth/guards'

const RestrictRoute = async ({ children }: { children: ReactNode }) => {
  await redirectIfAuthenticated('/')

  return <>{children}</>
}

export default RestrictRoute
