'use client'

import type { ReactNode } from 'react'
import AuthInterceptor from '@/app/providers/AuthInterceptor'
import { useSessionBootstrap } from '@/features/session/useSessionBootstrap'

interface AppProvidersProps {
  children: ReactNode
}

const AppProviders = ({ children }: Readonly<AppProvidersProps>) => {
  useSessionBootstrap()

  return (
    <AuthInterceptor>
      {children}
    </AuthInterceptor>
  )
}

export default AppProviders
