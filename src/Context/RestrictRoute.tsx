'use client'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { RootLayoutProps } from '@/app/layout'
import { useRouter } from 'next/navigation'
import Loader from '@/components/ui/Loader'

const RestrictRoute = ({ children }: RootLayoutProps) => {
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { isLoggedIn } = useAuthStore()

  useEffect(() => {
    if (isLoggedIn) {
      router.push('/')
    }
    setLoading(false)
  }, [isLoggedIn, router])

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
