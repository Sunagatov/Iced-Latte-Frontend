'use client'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { RootLayoutProps } from '@/app/layout'
import { useRouter } from 'next/navigation'
import Loader from '@/components/UI/Loader/Loader'

const PrivatRoute = ({ children }: RootLayoutProps) => {
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { isLoggedIn, setModalState } = useAuthStore()

  useEffect(() => {
    if (!isLoggedIn) {
      setModalState(true)
      router.replace('/auth/login')

    }
    setLoading(false)
  }, [isLoggedIn, router, setModalState])

  if (loading) {
    return (
      <div className="flex min-h-[100vh] w-full items-center justify-center">
        <Loader />
      </div>
    )
  }

  return <>{children}</>
}

export default PrivatRoute
