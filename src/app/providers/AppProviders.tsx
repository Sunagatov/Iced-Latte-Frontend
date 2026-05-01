'use client'

import type { ReactNode } from 'react'
import AuthInterceptor from '@/app/providers/AuthInterceptor'
import AppInitProvider from '@/app/providers/AppInitProvider'

interface AppProvidersProps {
  children: ReactNode
}

const AppProviders = ({ children }: Readonly<AppProvidersProps>) => {
  return (
    <AuthInterceptor>
      <AppInitProvider>{children}</AppInitProvider>
    </AuthInterceptor>
  )
}

export default AppProviders
