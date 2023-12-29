'use client'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { RootLayoutProps } from '@/app/layout'
import { redirect } from 'next/navigation'
import Loader from '@/components/ui/Loader'

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
    return (
      <div className="flex min-h-[100vh] w-full items-center justify-center">
        <Loader />
      </div>
    )
  }

  return <>{children}</>
}

export default RestrictRoute
