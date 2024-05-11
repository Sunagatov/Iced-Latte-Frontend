'use client'
import { FaStar } from 'react-icons/fa'
import { useState } from 'react'
import { useProductRatingStore } from '@/store/ratingStore'
import { useErrorHandler } from '@/services/apiError/apiError'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'

interface StarRatingProps {
  productId: string
  count: number
  activeColor: string
}

const StarRating = ({ productId, count, activeColor }: StarRatingProps) => {
  const [hoverItem, setHoverItem] = useState(-1)
  const { errorMessage, handleError } = useErrorHandler()
  const { ratings, setRating } = useProductRatingStore()
  const { token, setModalState } = useAuthStore()
  const router = useRouter()

  const productRatingData = ratings[productId] || { id: productId, rating: 0 }
  const { rating: currentRating } = productRatingData

  const stars = Array(count).fill(0)

  const handleRatingClick = (index: number) => {
    // const rating = index + 1

    try {
      // await apiAddProductRating(productId, rating)

      // setRating(productId, rating)
      if (token) {
        setRating(productId, index + 1)
      } else {
        router.push('/auth/login')
        setModalState(true)
      }
    } catch (error) {
      handleError(error)
    }
  }

  const handleMouseOver = (index: number) => {
    setHoverItem(index)
  }

  const handleMouseOut = () => {
    setHoverItem(-1)
  }

  return (
    <>
      {errorMessage && <div className="mt-4 text-negative">{errorMessage}</div>}
      <div className="mr-3 flex cursor-pointer items-center gap-1">
        {stars.map((_, index) => {
          const isActive = index < currentRating
          const isHover = index <= hoverItem

          return (
            <div
              key={index}
              onClick={() => handleRatingClick(index)}
              onMouseEnter={() => handleMouseOver(index)}
              onMouseLeave={handleMouseOut}
              style={{
                color:
                  isActive || isHover ? activeColor : 'rgba(4, 18, 27, 0.24)',
              }}
            >
              <FaStar className="h-10 w-10" />
            </div>
          )
        })}
      </div>
    </>
  )
}

export default StarRating
