'use client'
import { useState, useEffect } from 'react'
import { useSelectedLayoutSegment, useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

const useAuthRedirect = () => {
  const router = useRouter()
  const params = useParams()
  const selectedLayoutSegment = useSelectedLayoutSegment()
  const [previousRoute, setPreviousRoute] = useState<string | null>(null)
  const { resetOpenModal } = useAuthStore()

  useEffect(() => {
    setPreviousRoute(selectedLayoutSegment)
  }, [selectedLayoutSegment])

  const redirectToPreviousRoute = () => {
    if (previousRoute) {
      const dynamicId = params?.id

      const fullRoute = dynamicId
        ? `/${previousRoute}/${String(dynamicId)}`
        : `/${previousRoute}`

      router.push(fullRoute)

      resetOpenModal()
    } else {
      router.push('/')
    }
  }

  return { redirectToPreviousRoute }
}

export default useAuthRedirect
