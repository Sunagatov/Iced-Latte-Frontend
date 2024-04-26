'use client'
import { useAuthStore } from '@/store/authStore'
import { useFavouritesStore } from '@/store/favStore'
import { useRouter } from 'next/navigation'
import { removeCookie } from '@/utils/cookieUtils'
import { apiLogoutUser } from '@/services/authService'
import { useState } from 'react'
import {useProductReviewsStore} from "@/store/reviewsStore";
// import {useProductRatingStore} from "@/store/ratingStore";

const useLogout = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { reset } = useAuthStore()
  const { resetFav } = useFavouritesStore()
  const router = useRouter()
  const {
    setIsRaitingFormVisible,
    setIsReviewFormVisible,
    setIsReviewButtonVisible,
  } = useProductReviewsStore()

  // const { setRating } = useProductRatingStore()

  const logout = async () => {
    try {
      setIsLoading(true)
      await apiLogoutUser()
      await removeCookie('token')
      reset()
      resetFav()
      setIsReviewFormVisible(false)
      setIsRaitingFormVisible(false)
      setIsReviewButtonVisible(true)
      // setRating(null,0)

      router.push('/')
      // add other features
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  return { logout, isLoading }
}

export default useLogout
