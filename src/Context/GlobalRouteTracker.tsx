'use client'
import { useEffect, useRef } from 'react'
import { useLocalSessionStore } from '@/store/useLocalSessionStore'
import { usePathname } from 'next/navigation'
import { RootLayoutProps } from '@/app/layout'

const GlobalRouteTracker = ({ children }: RootLayoutProps) => {
  const { addPreviousRoute } = useLocalSessionStore()
  const pathname = usePathname()
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (!isFirstRender.current) {
      addPreviousRoute(pathname)
    } else {
      isFirstRender.current = false
    }
  }, [pathname, addPreviousRoute])

  return (
    <>
      {children}
    </>
  )
}

export default GlobalRouteTracker
