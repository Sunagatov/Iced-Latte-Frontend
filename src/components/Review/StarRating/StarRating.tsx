'use client'
import { FaStar } from 'react-icons/fa'
import { useState, useEffect } from 'react'
import { useProductRatingStore } from '@/store/ratingStore'
// import { apiAddProductRating } from '@/services/ratingService'
import { useErrorHandler } from '@/services/apiError/apiError'

interface StarRatingProps {
  productId: string;
  count: number;
  activeColor: string;
}

const StarRating = ({ productId, count, activeColor }: StarRatingProps) => {
  const [hoverItem, setHoverItem] = useState(-1)
  const { errorMessage, handleError } = useErrorHandler()
  const { ratings, setRating, getProductRating } = useProductRatingStore()

  const productRatingData = ratings[productId] || { id: productId, rating: 0 }
  const { rating: currentRating } = productRatingData

  const stars = Array(count).fill(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getProductRating(productId)
      } catch (error) {
        handleError(error)
      }
    }

    void fetchData()
  }, [getProductRating, handleError, productId])

  const handleRatingClick = (index: number) => {
    // const rating = index + 1

    try {
      // await apiAddProductRating(productId, rating)

      // setRating(productId, rating)
      setRating(productId, index + 1)
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
      {errorMessage && (
        <div className="mt-4 text-negative">
          {errorMessage}
        </div>
      )}
      <div className='flex items-center gap-1 cursor-pointer mr-3'>
        {stars.map((_, index) => {
          const isActive = index < currentRating
          const isHover = index <= hoverItem

          return (
            <div
              key={index}
              onClick={() => handleRatingClick(index)}
              onMouseEnter={() => handleMouseOver(index)}
              onMouseLeave={handleMouseOut}
              style={{ color: isActive || isHover ? activeColor : 'rgba(4, 18, 27, 0.24)' }}
            >
              <FaStar className='w-10 h-10' />
            </div>)
        })}
      </div >
    </>
  )
}

export default StarRating
