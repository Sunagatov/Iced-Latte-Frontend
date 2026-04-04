'use client'
import { FaStar } from 'react-icons/fa'
import { useState } from 'react'
import { useProductRatingStore } from '@/features/reviews/store'
import { useAuthStore } from '@/features/auth/store'
import { useRouter } from 'next/navigation'

interface StarRatingProps {
  productId: string
  count: number
  activeColor?: string
  size?: 'sm' | 'md' | 'lg'
}

const labels: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Great',
  5: 'Excellent',
}

const StarRating = ({ productId, count, activeColor = '#682EFF', size = 'lg' }: StarRatingProps) => {
  const [hoverItem, setHoverItem] = useState(-1)
  const { ratings, setRating } = useProductRatingStore()
  const { isLoggedIn } = useAuthStore()
  const router = useRouter()

  const productRatingData = ratings[productId] || { id: productId, rating: 0 }
  const { rating: currentRating } = productRatingData
  const displayRating = hoverItem >= 0 ? hoverItem + 1 : currentRating

  const sizeClass = size === 'lg' ? 'h-9 w-9' : size === 'md' ? 'h-6 w-6' : 'h-4 w-4'

  const handleRatingClick = (index: number) => {
    if (isLoggedIn) {
      setRating(productId, index + 1)
    } else {
      router.push('/signin')
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        {Array(count).fill(0).map((_, index) => {
          const isActive = index < displayRating

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleRatingClick(index)}
              onMouseEnter={() => setHoverItem(index)}
              onMouseLeave={() => setHoverItem(-1)}
              className="transition-transform hover:scale-110 active:scale-95"
              aria-label={`Rate ${index + 1} stars`}
            >
              <FaStar
                className={sizeClass}
                style={{ color: isActive ? activeColor : 'rgba(4,18,27,0.15)' }}
              />
            </button>
          )
        })}
        {displayRating > 0 && (
          <span className="ml-2 text-sm font-medium text-secondary">
            {labels[displayRating]}
          </span>
        )}
      </div>
    </div>
  )
}

export default StarRating
