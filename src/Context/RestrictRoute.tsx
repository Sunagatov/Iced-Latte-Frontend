'use client'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { RootLayoutProps } from '@/app/layout'
import { redirect } from 'next/navigation'

const RestrictRoute = ({ children }: RootLayoutProps) => {
  const [loading, setLoading] = useState(true)

  const { isLoggedIn } = useAuthStore()

  useEffect(() => {
    if (isLoggedIn) {
      redirect('/')
    }
    setLoading(false)
  }, [isLoggedIn])

  if (loading) {
    return <p>Loading...</p>
  }

  return <>{children}</>
}

export default RestrictRoute
