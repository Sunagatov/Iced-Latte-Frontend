'use client'
import { useEffect, useState } from 'react'
import { RootLayoutProps } from '@/app/layout'
import { useRouter } from 'next/navigation'
import { getCookie } from '@/utils/cookieUtils'
import Loader from '@/components/UI/Loader/Loader'

const RestrictRoute = ({ children }: RootLayoutProps) => {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkToken = async () => {
      try {
        setLoading(true)
        const token = await getCookie()

        if (token) {
          router.push('/')
        }
      } catch (error) {
        console.log(error)
      } finally { setLoading(false) }
    }

    void checkToken()

  }, [router])

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

