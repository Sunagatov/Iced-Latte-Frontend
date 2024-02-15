'use client'
import { FaStar } from 'react-icons/fa'
import { useState } from 'react'
import { useProductRatingStore } from '@/store/ratingStore'

interface StarRatingProps {
  productId: string;
  count: number;
  activeColor: string;
}

const StarRating = ({ productId, count, activeColor }: StarRatingProps) => {
  const [hoverItem, setHoverItem] = useState(-1)

  const { ratings, setRating } = useProductRatingStore()

  const productRatingData = ratings[productId] || { id: productId, rating: 0 }
  const { rating: currentRating } = productRatingData


  const stars = Array(count).fill(0)

  const handleRatingClick = (index: number) => {
    setRating(productId, index + 1)
  }

  const handleMouseOver = (index: number) => {
    setHoverItem(index)
  }

  const handleMouseOut = () => {
    setHoverItem(-1)
  }

  return (
    <div className='flex items-center gap-1 cursor-pointer mr-3'>
      {stars.map((_, index) => {
        const isActive = index < currentRating
        const isHover = index <= hoverItem

        return (
          <div
            key={index}
            onClick={() => handleRatingClick(index)}
            onMouseMove={() => handleMouseOver(index)}
            onMouseOut={handleMouseOut}
            style={{ color: isActive || isHover ? activeColor : 'rgba(4, 18, 27, 0.24)' }}
          >
            <FaStar className='w-10 h-10' />
          </div>)
      })}
    </div >
  )
}

export default StarRating
