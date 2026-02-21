'use client'
import { useEffect, useRef, useMemo } from 'react'
import { useLocalSessionStore } from '@/store/useLocalSessionStore'
import { usePathname } from 'next/navigation'
import { RootLayoutProps } from '@/app/layout'

const GlobalRouteTracker = ({ children }: { children: React.ReactNode }) => {
  const { addPreviousRouteForAuth, setRoutingRelatedAuthCompleted } = useLocalSessionStore()
  const pathname = usePathname()
  const isFirstRender = useRef(true)
  const authPaths = useMemo(() => ['/signin', '/signup', '/confirm_registration'], [])

  useEffect(() => {
    setRoutingRelatedAuthCompleted(authPaths.includes(pathname))
  }, [authPaths, pathname, setRoutingRelatedAuthCompleted])

  useEffect(() => {
    if (!isFirstRender.current) {
      addPreviousRouteForAuth(pathname)
    } else {
      isFirstRender.current = false
    }
  }, [pathname, addPreviousRouteForAuth])

  return (
    <>
      {children}
    </>
  )
}

export default GlobalRouteTracker
