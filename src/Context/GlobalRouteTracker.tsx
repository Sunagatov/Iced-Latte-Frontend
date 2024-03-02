'use client'
import { useEffect, useRef } from 'react'
import { useLocalSessionStore } from '@/store/useLocalSessionStore'
import { usePathname } from 'next/navigation'
import { RootLayoutProps } from '@/app/layout'

const GlobalRouteTracker = ({ children }: RootLayoutProps) => {
  const { addPreviousRoute, addPreviousRouteForLogin, setRoutingRelatedLoginCompleted } = useLocalSessionStore()
  const pathname = usePathname()
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (pathname === '/auth/registration' || pathname === '/auth/login') {
      return setRoutingRelatedLoginCompleted(true)
    } else {
      setRoutingRelatedLoginCompleted(false)
    }
  }, [pathname, setRoutingRelatedLoginCompleted])

  useEffect(() => {
    if (!isFirstRender.current) {
      addPreviousRoute(pathname)
      addPreviousRouteForLogin(pathname)
    } else {
      isFirstRender.current = false
    }
  }, [pathname, addPreviousRoute, addPreviousRouteForLogin])

  return (
    <>
      {children}
    </>
  )
}

export default GlobalRouteTracker
