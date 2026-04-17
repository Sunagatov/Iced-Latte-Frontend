'use client'

import type { ReactNode } from 'react'
import { useSessionBootstrap } from '@/features/session/useSessionBootstrap'

interface AppInitProviderProps {
  children: ReactNode
}

const AppInitProvider = ({ children }: Readonly<AppInitProviderProps>) => {
  useSessionBootstrap()

  return <>{children}</>
}

export default AppInitProvider
