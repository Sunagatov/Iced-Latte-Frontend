'use client'

import Button from '@/components/UI/Buttons/Button/Button'
import ScrollUpBtn from '@/components/UI/Buttons/ScrollUpBtn/ScrollUpBtn'
import { BiLike, BiDislike } from 'react-icons/bi'
import { Review } from '@/types/ProductReviewType'
import { FaStar } from 'react-icons/fa'
import { useEffect, useState } from 'react'
import { useLocalSessionStore } from '@/store/useLocalSessionStore'
import { useMediaQuery } from 'usehooks-ts'
import { formatReviewDate } from '@/components/Review/CommentsList/formatReviewDate'
import { apiDeleteProductReview } from '@/services/reviewService'
import { handleAxiosError } from '@/services/apiError/apiError'
import { useAuthStore } from '@/store/authStore'
import { useProductReviewsStore } from '@/store/reviewsStore'

interface CommentListProps {
  comments: Review[];
  userReview: Review | null;
  productId: string;
}

const CommentList = ({ comments, userReview, productId }: CommentListProps) => {
  const [loadedComments, setLoadedComments] = useState(comments.slice(0, 3))
  const [lastLoadedIndex, setLastLoadedIndex] = useState(2)
  const [showLoadMore, setShowLoadMore] = useState(true)
  const { expandedComments, setExpandedComments } = useLocalSessionStore()
  const isMediaQuery = useMediaQuery('(min-width: 768px)', { initializeWithValue: false })

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)

  const {
    setIsReviewFormVisible,
    setIsReviewButtonVisible,
    setIsRaitingFormVisible,
  } = useProductReviewsStore()

  useEffect(() => {
    setLoadedComments(comments.slice(0, 3))
  }, [comments])


  const filteredComments = loadedComments.filter(comment => userReview && comment.productReviewId !== userReview.productReviewId)

  const loadMoreComments = () => {
    const newComments = comments.slice(lastLoadedIndex + 1, lastLoadedIndex + 4)

    setLastLoadedIndex(lastLoadedIndex + 3)
    setLoadedComments((prevComments) => [...prevComments, ...newComments])

    if (lastLoadedIndex + 3 >= comments.length - 1) {
      setShowLoadMore(false)
    }
  }

  const toggleCommentExpansion = (productReviewId: string) => {
    setExpandedComments(prevState => ({
      ...prevState,
      [productReviewId]: !prevState[productReviewId]
    }))
  }

  const handleDeleteComment = async (productReviewId: string, productId: string): Promise<void> => {
    try {
      await apiDeleteProductReview(productReviewId, productId)
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

  const handleLikeComment = (productReviewId: string) => {
    console.log(`Liking comment with ID ${productReviewId}`)
  }

  const handleDislikeComment = (productReviewId: string) => {
    console.log(`Disliking comment with ID ${productReviewId}`)

  }

  const hasUserReview = userReview && Object.values(userReview).some(value => value !== null)

  return (

    <>
      {hasUserReview &&
        (<div className='mt-10 xl:mt-20'>
          <div className="font-medium text-XL text-primary mb-2 xl:text-2XL">
            <span>{userReview.userName} {userReview.userLastName}</span>
          </div>
          <div className="font-medium text-[18px] text-primary mb-6 flex items-center">
            <div className='flex items-center gap-1'>
              {
                [...Array(5)].map((_, productReviewId) => (
                  <FaStar className={`w-[18px] h-[18px] ${productReviewId < userReview.rating ? 'text-positive' : 'text-disabled'} xl:w-6 xl:h-6`} key={userReview.productReviewId} />
                ))}
              <span className="font-medium text-L text-primary ml-2">{userReview.rating || 0}</span>
            </div>
            <div className="inline-flex font-medium text-L text-tertiary">
              <div className='inline-flex relative ml-3'>
                <span className='ml-[10px] text-L'></span>
                <div className="text-tertiary h-[5px] w-[5px] rounded-full bg-gray-400 absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>
              <span className='ml-2'>{formatReviewDate(userReview.createdAt).date}</span>
              <span className='ml-2'>{formatReviewDate(userReview.createdAt).time}</span>
            </div>
          </div>
          <p className={`rounded-[8px] text-L px-4 py-[17px] mb-6 ${isLoggedIn ? 'bg-brand-second' : 'bg-secondary'}`}>{userReview.text}</p>
          {isLoggedIn && <Button
            onClick={() => handleDeleteComment(userReview.productReviewId, productId)}
            className="w-[126px] rounded-[47px] py-4 px-6 bg-secondary font-medium text-L text-primary mr-auto md:w-[196px]">{isMediaQuery ? 'Delete my review' : 'Delete'}</Button>}
        </div >)}

      <ul className='flex gap-10 flex-col mt-10 '>
        {filteredComments.map((comment) => {
          const { date, time } = formatReviewDate(comment.createdAt)

          return (
            <li className={`pb-6 xl:pb-10`} key={comment.productReviewId} >
              <div className="font-medium text-XL text-primary mb-2 xl:text-2XL">
                <span>{comment.userName} {comment.userLastName}</span>
              </div>
              <div className="font-medium text-[18px] text-primary mb-6 flex items-center">
                <div className='flex items-center gap-1 '>
                  {[...Array(5)].map((_, productReviewId) => (
                    <FaStar className={`w-[18px] h-[18px] ${productReviewId < comment.rating ? 'text-positive' : 'text-disabled'} xl:w-6 xl:h-6`} key={comment.productReviewId} />
                  ))}
                  <span className="font-medium text-L text-primary ml-2">{comment.rating || 0}</span>
                </div>
                <div className="inline-flex font-medium text-L text-tertiary">
                  <div className='inline-flex relative ml-3'>
                    <span className='ml-[10px] text-L'>{date}</span>
                    <div className="text-tertiary h-[5px] w-[5px] rounded-full bg-gray-400 absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2"></div>
                  </div>
                  <span className='ml-2'>{time}</span>
                </div>
              </div>

              {comment.text && comment.text.length > 300 && !expandedComments[`${comment.productReviewId}`] ? (

                <p className="rounded-[8px] text-L px-4 py-[17px] mb-6 bg-secondary">
                  {comment.text.slice(0, 300)}
                  <Button
                    onClick={() => toggleCommentExpansion(`${comment.productReviewId}`)}
                    className="pl-0 h-auto text-tertiary text-L font-medium inline-flex bg-transparent">...see more</Button>
                </p>
              ) : (
                <p className="rounded-[8px] text-L px-4 py-[17px] mb-6 bg-secondary">
                  {comment.text || 'No review'}
                </p>
              )}
              <div className="flex justify-between items-center">
                <div className='flex gap-2 xl:ml-auto'>
                  <Button
                    onClick={() => handleLikeComment(`${comment.productReviewId}`)}
                    className="rounded-[47px] bg-secondary w-[88px] text-tertiary font-medium flex items-center justify-center gap-2">
                    <BiLike />
                    <span>
                      {17}
                    </span>
                  </Button>
                  <Button
                    onClick={() => handleDislikeComment(`${comment.productReviewId}`)}
                    className="rounded-[47px] bg-secondary w-[88px] text-tertiary font-medium flex items-center justify-center gap-2">
                    <BiDislike />
                    <span>
                      {3}
                    </span>
                  </Button>
                </div>
              </div>
            </li>
          )
        })}
        <ScrollUpBtn />
      </ul >
      {
        showLoadMore && (
          <Button onClick={loadMoreComments} className='flex items-center justify-center rounded-[47px] w-[334px] ml-auto mr-auto mb-[94px] mt-[24px] bg-secondary font-medium text-[18px] text-primary'>Show more</Button>
        )
      }
    </>
  )
}

export default CommentList
