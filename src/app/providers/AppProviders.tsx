'use client'

import type { ReactNode } from 'react'
import AuthInterceptor from '@/app/providers/AuthInterceptor'
import { useSessionBootstrap } from '@/features/session/useSessionBootstrap'
import { SupportChatWidget } from '@/features/support-chat/public'

interface AppProvidersProps {
  children: ReactNode
}

const AppProviders = ({ children }: Readonly<AppProvidersProps>) => {
  useSessionBootstrap()

  return (
    <AuthInterceptor>
      {children}
      <SupportChatWidget />
    </AuthInterceptor>
  )
}

export default AppProviders
