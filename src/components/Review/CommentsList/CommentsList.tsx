'use client'

import Button from '@/components/UI/Buttons/Button/Button'
import ScrollUpBtn from '@/components/UI/Buttons/ScrollUpBtn/ScrollUpBtn'
import { BiLike, BiDislike } from 'react-icons/bi'
import { FaStar } from 'react-icons/fa'
import React from 'react'
import { useMediaQuery } from 'usehooks-ts'
import { formatReviewDate } from '@/components/Review/CommentsList/formatReviewDate'
import { apiDeleteProductReview } from '@/services/reviewService'
import { handleAxiosError } from '@/services/apiError/apiError'
import { useAuthStore } from '@/store/authStore'
import { useProductReviewsStore } from '@/store/reviewsStore'
import Comment from '@/components/Review/CommentsList/Comment'

interface CommentListProps {
  productId: string
}

const CommentList = ({ productId }: CommentListProps) => {
  const {
    setIsReviewFormVisible,
    setIsReviewButtonVisible,
    setIsRaitingFormVisible,
    setProductReviewsData,
    getProductReviews,

    userReview,
    totalElements,
    currentPage,
    filteredReviewsWithRatings,
    reviewsWithRatings,
  } = useProductReviewsStore()

  const isMediaQuery = useMediaQuery('(min-width: 768px)', { initializeWithValue: false })

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)

  const showLoadMore = totalElements > reviewsWithRatings.length

  // Function for uploading additional comments
  const loadMoreComments = async () => {
    const loadedReviews = await getProductReviews(productId, currentPage + 1)

    setProductReviewsData({
      reviewsData: loadedReviews,
      userReview,
    })
  }

  const handleDeleteComment = async (productReviewId: string | null, productId: string): Promise<void> => {
    try {
      // перенести в reviewsStore
      productReviewId && await apiDeleteProductReview(productReviewId, productId)
      await useProductReviewsStore.getState().getProductUserReview(productId)
      await useProductReviewsStore.getState().getProductReviews(productId)



      setIsReviewFormVisible(false)
      setIsReviewButtonVisible(true)
      setIsRaitingFormVisible(false)

    }
    catch (error) {
      handleAxiosError(error)
    }

  }

  // Like and dislike buttons //

  const handleLikeComment = (productReviewId: string) => {
    console.log(`Liking comment with ID ${productReviewId}`)
  }

  const handleDislikeComment = (productReviewId: string) => {
    console.log(`Disliking comment with ID ${productReviewId}`)

  }

  const hasUserReview = userReview && Object.values(userReview).some(value => value !== null)


  return (
    <>
      {hasUserReview && (
        <div className="mt-10 xl:mt-20">
          <div className="mb-2 text-XL font-medium text-primary xl:text-2XL">
            <span>
              {userReview.userName} {userReview.userLastName}
            </span>
          </div>
          <div className="mb-6 flex items-center text-[18px] font-medium text-primary">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, productReviewId) => (
                <FaStar
                  className={`h-[18px] w-[18px] ${userReview.rating &&productReviewId < userReview.rating ? 'text-positive' : 'text-disabled'} xl:h-6 xl:w-6`}
                  key={userReview.productReviewId}
                />
              ))}
              <span className="ml-2 text-L font-medium text-primary">
                {userReview.rating || 0}
              </span>
            </div>
            <div className="inline-flex text-L font-medium text-tertiary">
              <div className="relative ml-3 inline-flex">
                <span className="ml-[10px] text-L"></span>
                <div className="absolute left-0 top-1/2 h-[5px] w-[5px] -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-gray-400 text-tertiary"></div>
              </div>
              <span className="ml-2">
                {formatReviewDate(userReview.createdAt).date}
              </span>
              <span className="ml-2">
                {formatReviewDate(userReview.createdAt).time}
              </span>
            </div>
          </div>
          <p
            className={`mb-6 rounded-[8px] px-4 py-[17px] text-L ${isLoggedIn ? 'bg-brand-second' : 'bg-secondary'}`}
          >
            {userReview.text}
          </p>
          {isLoggedIn && (
            <Button
              id="delete-review-btn"
              onClick={() =>
                handleDeleteComment(userReview.productReviewId, productId)
              }
              className="mr-auto w-[126px] rounded-[47px] bg-secondary px-6 py-4 text-L font-medium text-primary md:w-[196px]"
            >
              {isMediaQuery ? 'Delete my review' : 'Delete'}
            </Button>
          )}
        </div>
      )}

      <ul className="mt-10 flex flex-col gap-10 ">
        {filteredReviewsWithRatings.map((comment) => {
          const { date, time } = formatReviewDate(comment.createdAt)

          return (
            <li className={`pb-6 xl:pb-10`} key={comment.productReviewId}>
              <div className="mb-2 text-XL font-medium text-primary xl:text-2XL">
                <span>
                  {comment.userName} {comment.userLastName}
                </span>
              </div>
              <div className="mb-6 flex items-center text-[18px] font-medium text-primary">
                <div className="flex items-center gap-1 ">
                  {[...Array(5)].map((_, productReviewId) => (
                    <FaStar
                      className={`h-[18px] w-[18px] ${comment.rating && productReviewId < comment.rating ? 'text-positive' : 'text-disabled'} xl:h-6 xl:w-6`}
                      key={comment.productReviewId}
                    />
                  ))}
                  <span className="ml-2 text-L font-medium text-primary">
                    {comment.rating || 0}
                  </span>
                </div>
                <span className="ml-2 text-L font-medium text-primary">
                  {comment.rating || 0}/5
                </span>
                <div className="inline-flex text-L font-medium text-tertiary">
                  <div className="relative ml-3 inline-flex">
                    <span className="ml-[10px] text-L">{date}</span>
                    <div className="absolute left-0 top-1/2 h-[5px] w-[5px] -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-gray-400 text-tertiary"></div>
                  </div>
                  <span className="ml-2">{time}</span>
                </div>
              </div>

              <Comment comment={comment} />

              <div className="flex items-center justify-between">
                <div className="flex gap-2 xl:ml-auto">
                  <Button
                    id="like-btn"
                    onClick={() =>
                      handleLikeComment(`${comment.productReviewId}`)
                    }
                    className="flex w-[88px] items-center justify-center gap-2 rounded-[47px] bg-secondary font-medium text-tertiary"
                  >
                    <BiLike />
                    <span>{17}</span>
                  </Button>
                  <Button
                    id="dislike-btn"
                    onClick={() =>
                      handleDislikeComment(`${comment.productReviewId}`)
                    }
                    className="flex w-[88px] items-center justify-center gap-2 rounded-[47px] bg-secondary font-medium text-tertiary"
                  >
                    <BiDislike />
                    <span>{3}</span>
                  </Button>
                </div>
              </div>
            </li>
          )
        })}
        <ScrollUpBtn />
      </ul>
      {showLoadMore && (
        <Button
          id="showmore-btn"
          onClick={loadMoreComments}
          className="mb-[94px] ml-auto mr-auto mt-[24px] flex w-[334px] items-center justify-center rounded-[47px] bg-secondary text-[18px] font-medium text-primary"
        >
          Show more
        </Button>
      )}
    </>
  )
}

export default CommentList
