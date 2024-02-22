'use client'
import { useEffect, useRef } from 'react'
import { useLocalSessionStore } from '@/store/useLocalSessionStore'
import { usePathname } from 'next/navigation'
import { RootLayoutProps } from '@/app/layout'

const GlobalRouteTracker = ({ children }: RootLayoutProps) => {
  const { previousRoutes, addPreviousRoute } = useLocalSessionStore()
  const pathname = usePathname()
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (!isFirstRender.current) {
      const lastRoute = previousRoutes[previousRoutes.length - 1]

      const currentPathname = pathname.trim()

      console.log('Last Route:', lastRoute)
      console.log('Current Pathname:', currentPathname)

      if (lastRoute !== currentPathname) {
        addPreviousRoute(currentPathname)
      }
    } else {
      isFirstRender.current = false
    }
  }, [pathname, addPreviousRoute, previousRoutes])

  return (
    <>
      {children}
    </>
  )
}

export default GlobalRouteTracker
