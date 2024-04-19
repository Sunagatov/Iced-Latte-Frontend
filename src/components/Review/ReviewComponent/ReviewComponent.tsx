'use client'
import ReviewRatingFilter from '@/components/Review/ReviewRatingFilter/ReviewRatingFilter'
import ReviewForm from '../ReviewForm/ReviewForm'
import CommentList from '../CommentsList/CommentsList'
import React, { useEffect } from 'react'
import {
  checkIfUserReviewExists,
  ISetProductReviewsData,
  isIGetProductReviews,
  useProductReviewsStore,
} from '@/store/reviewsStore'
import { useErrorHandler } from '@/services/apiError/apiError'
import { Review } from '@/types/ProductReviewType'
import { useAuthStore } from '@/store/authStore'

interface ReviewComponentProps {
  productId: string;
}

const ReviewComponent = React.memo(function ReviewComponent1({ productId }: ReviewComponentProps) {
  const { errorMessage, handleError } = useErrorHandler()

  const productReviewsData = useProductReviewsStore()
  const {
    getProductReviews,
    getProductUserReview,
    syncReviewsDataOnLogin,
    syncReviewsDataOnLogout,
    setIsReviewFormVisible,
    setIsReviewButtonVisible,
    setIsRaitingFormVisible,
    resetProductReviewsData,
    updateProductReviewsData,

    filteredReviewsWithRatings,
  } = productReviewsData


  const hasComments = filteredReviewsWithRatings.length > 0

  const { token } = useAuthStore()

  useEffect(() => {
    return () => {
      resetProductReviewsData()
    }
  }, [resetProductReviewsData])

  useEffect(() => {
    async function getProductReviewsData(productId: string): Promise<void> {
      try {
        const getProductReviewsPromise = getProductReviews(productId, 0, 3)

        interface PromiseResult<T> {
          value: T
          status: 'fulfilled' | 'rejected'
        }

        const getProductUserReviewPromise = token
          ? await getProductUserReview(productId)
          : await new Promise<PromiseResult<Review | null>>((resolve) => resolve({
            value: {
              productReviewId: null,
              rating: null,
              text: null,
              createdAt: null,
              userName: null,
              userLastName: null,
            },
            status: 'fulfilled'
          }))

        const results = await Promise.allSettled([
          getProductReviewsPromise,
          getProductUserReviewPromise
        ])

        const productReviewsData: ISetProductReviewsData = {
          reviewsData: {
            reviewsWithRatings: [],
            currentPage: 0,
            totalElements: 0,
            totalPages: 0,
            currentSize: 0,
          },
          userReview: null,
        }

        results.forEach((result) => {
          if (result.status === 'fulfilled') {
            if (isIGetProductReviews(result.value)) {

              productReviewsData.reviewsData = result.value
            } else if (result.value && 'productReviewId' in result.value) {

              productReviewsData.userReview = result.value

              if (checkIfUserReviewExists(productReviewsData.userReview)) {
                setIsReviewFormVisible(false)
                setIsReviewButtonVisible(false)
                setIsRaitingFormVisible(false)
              } else {
                setIsReviewFormVisible(false)
                setIsReviewButtonVisible(true)
                setIsRaitingFormVisible(false)
              }
            }
          }
        })

        updateProductReviewsData(productReviewsData)

      } catch (error) {
        handleError(error)
      }
    }
    void getProductReviewsData(productId)
  }, [
    productId,
    getProductReviews,
    getProductUserReview,
    updateProductReviewsData,
    handleError,
    token,
    setIsRaitingFormVisible,
    setIsReviewFormVisible,
    setIsReviewButtonVisible,
  ])




  useEffect(() => {
    async function getUserReview(productId: string): Promise<Review> {
      return await getProductUserReview(productId)
    }

    async function syncReviewsDataWithAuth() {
      if (token) {
        const userReview = await getUserReview(productId)

        if (checkIfUserReviewExists(userReview)) {
          setIsReviewFormVisible(false)
          setIsReviewButtonVisible(false)
          setIsRaitingFormVisible(false)
        } else {
          setIsReviewFormVisible(false)
          setIsReviewButtonVisible(true)
          setIsRaitingFormVisible(false)
        }

        syncReviewsDataOnLogin(userReview)
      } else {
        syncReviewsDataOnLogout()
        setIsReviewFormVisible(false)
        setIsReviewButtonVisible(true)
        setIsRaitingFormVisible(false)
      }
    }

    void syncReviewsDataWithAuth()
  }, [
    token,
    getProductUserReview,
    syncReviewsDataOnLogin,
    syncReviewsDataOnLogout,
    productId,
  ])

  // function for processing the rating filter
  const handleRatingChange = (value: number | null) => {
    console.log(value)
  }

  return (
    <div className="relative ml-auto mr-auto max-w-[1157px]">
      <div className="flex flex-col-reverse xl:flex-row xl:justify-between">
        <h2 className="xl:4XL order-[1] mb-7 text-4XL font-medium text-primary xl:absolute xl:left-0 xl:top-0 xl:order-[0] ">
          Rating and reviews
        </h2>
        <div>
          <div className="xl:max-w-[800px]">
            <ReviewForm productId={productId} />
            {hasComments && (
              <CommentList
                productId={productId}
              />
            )}
            {errorMessage && (
              <div className="mt-4 text-negative">{errorMessage}</div>
            )}
          </div>
        </div>

        <div className="text-[18px] font-medium text-tertiary">
          {hasComments ? (
            <ReviewRatingFilter onChange={handleRatingChange} />
          ) : (
            <div className="text-end">No customer review</div>
          )}
        </div>
      </div>
    </div>
  )
})



export default ReviewComponent
