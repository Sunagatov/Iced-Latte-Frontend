import { useState, useEffect } from 'react'
import { apiGetProductUserReview } from '@/services/reviewService'
import { useErrorHandler } from '@/services/apiError/apiError'

export function useUserReviewStatus(productId: string) {
  const [hasUserReviewed, setHasUserReviewed] = useState(false)
  const { handleError } = useErrorHandler()

  useEffect(() => {
    const checkUserReview = async () => {
      try {
        const response = await apiGetProductUserReview(productId)

        console.log('response', response)

        const reviewIsEmpty = Object.values(response).every(
          (value) => value === null,
        )

        setHasUserReviewed(!reviewIsEmpty)
      } catch (error) {
        console.error('Error checking user review status:', error)
        handleError(error)
      }
    }

    void checkUserReview()
  }, [productId, handleError])

  return hasUserReviewed
}
