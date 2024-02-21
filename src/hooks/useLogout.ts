'use client'
import { useAuthStore } from '@/store/authStore'
import { useFavouritesStore } from '@/store/favStore'
import { useLocalSessionStore } from '@/store/useLocalSessionStore'
import { useRouter } from 'next/navigation'
import { removeCookie } from '@/utils/cookieUtils'

const useLogout = () => {
  const { reset } = useAuthStore()
  const { resetFav } = useFavouritesStore()
  const {
    setIsReviewFormVisible,
    setIsReviewButtonVisible,
    setSelectedRating,
  } = useLocalSessionStore()
  const router = useRouter()

  const logout = async () => {
    try {
      router.push('/')
      await removeCookie('token')
      reset()
      resetFav()
      setIsReviewFormVisible(false)
      setIsReviewButtonVisible(true)
      setSelectedRating(null)
      // add other features
    } catch (error) {
      console.log(error)
    }
  }

  return logout
}

export default useLogout
