'use client'
import { useEffect, useRef, useMemo } from 'react'
import { useLocalSessionStore } from '@/features/user/store'
import { usePathname } from 'next/navigation'

const RouteTracker = ({ children }: { children: React.ReactNode }) => {
  const { addPreviousRouteForAuth, setRoutingRelatedAuthCompleted } = useLocalSessionStore()
  const pathname = usePathname()
  const isFirstRender = useRef(true)
  const authPaths = useMemo(() => ['/signin', '/signup', '/confirm_registration', '/forgotpass', '/resetpass', '/auth/google/callback'], [])

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

  return <>{children}</>
}

export default RouteTracker
