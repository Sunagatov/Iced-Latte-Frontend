'use client'

import type { ReactNode } from 'react'
import AuthInterceptor from '@/app/providers/AuthInterceptor'
import { useSessionBootstrap } from '@/features/session/useSessionBootstrap'
import { bootstrapClientSession } from '@/features/session/session'
import { useAuthStore } from '@/features/auth/store'
import { SupportChatWidget } from '@/features/support-chat/public'

interface AppProvidersProps {
  children: ReactNode
}

const AppProviders = ({ children }: Readonly<AppProvidersProps>) => {
  useSessionBootstrap()
  const bootstrapError = useAuthStore((state) => state.bootstrapError)

  return (
    <AuthInterceptor>
      {bootstrapError ? (
        <main
          className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center"
          role="alert"
        >
          <p>{bootstrapError}</p>
          <button
            type="button"
            className="bg-brand-solid rounded-full px-5 py-2 text-white"
            onClick={() => {
              useAuthStore.getState().setLoading()
              void bootstrapClientSession()
            }}
          >
            Try again
          </button>
        </main>
      ) : (
        <>
          {children}
          <SupportChatWidget />
        </>
      )}
    </AuthInterceptor>
  )
}

export default AppProviders
