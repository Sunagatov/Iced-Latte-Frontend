import { useState, useEffect } from 'react'
import { apiCheckProductReview } from '@/services/reviewService'
import { useErrorHandler } from '@/services/apiError/apiError'

export function useUserReviewStatus(productId: string) {
  const [hasUserReviewed, setHasUserReviewed] = useState(false)
  const { handleError } = useErrorHandler()

  useEffect(() => {
    const checkUserReview = async () => {
      try {
        const response = await apiCheckProductReview(productId)

        if (response.reviewText && response.reviewText.trim().length > 0) {
          setHasUserReviewed(true)
        } else {
          setHasUserReviewed(false)
        }
      } catch (error) {
        console.error('Error checking user review status:', error)
        handleError(error)
      }
    }

    void checkUserReview()
  }, [productId])

  return hasUserReviewed
}
