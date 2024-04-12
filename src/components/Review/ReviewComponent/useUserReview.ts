import { useEffect } from 'react'
import { apiGetProductUserReview } from '@/services/reviewService'
import { useErrorHandler } from '@/services/apiError/apiError'
import { useLocalSessionStore } from '@/store/useLocalSessionStore'
import { useAuthStore } from '@/store/authStore'

export function useUserReview(productId: string) {
  const {
    setIsReviewFormVisible,
    setIsReviewButtonVisible,
    setIsRaitingFormVisible
  } = useLocalSessionStore()

  const { token } = useAuthStore()

  const { handleError } = useErrorHandler()

  useEffect(() => {
    const checkUserReview = async () => {
      try {
        const response = await apiGetProductUserReview(productId)

        if (response && response.productReviewId) {
          setIsReviewFormVisible(false)
          setIsReviewButtonVisible(false)
          setIsRaitingFormVisible(false)
        } else {
          setIsReviewFormVisible(false)
          setIsReviewButtonVisible(true)
          setIsRaitingFormVisible(false)
        }

      } catch (error) {
        console.error('Error checking user review status:', error)
        handleError(error)
      }
    }

    if (token) {
      void checkUserReview()
    } else {
      setIsReviewFormVisible(false)
      setIsReviewButtonVisible(true)
      setIsRaitingFormVisible(false)
    }


  }, [
    productId,
    handleError,
    token,
    setIsReviewFormVisible,
    setIsReviewButtonVisible,
    setIsRaitingFormVisible,
  ])
}
