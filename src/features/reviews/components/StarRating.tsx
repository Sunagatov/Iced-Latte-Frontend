'use client'
import { useState } from 'react'
import { useProductRatingStore } from '@/features/reviews/store'
import { useAuthStore } from '@/features/auth/store'
import { useRouter } from 'next/navigation'

const STAR_PATH =
  'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z'

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

const StarRating = ({
  productId,
  count,
  activeColor = '#1B4332',
  size = 'lg',
}: StarRatingProps) => {
  const [hoverItem, setHoverItem] = useState(-1)
  const { ratings, setRating } = useProductRatingStore()
  const isLoggedIn = useAuthStore((state) => state.status === 'authenticated')
  const router = useRouter()

  const productRatingData = ratings[productId] || { id: productId, rating: 0 }
  const { rating: currentRating } = productRatingData
  const displayRating = hoverItem >= 0 ? hoverItem + 1 : currentRating

  const sizeClass =
    size === 'lg' ? 'h-9 w-9' : size === 'md' ? 'h-6 w-6' : 'h-4 w-4'

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
        {Array(count)
          .fill(0)
          .map((_, index) => {
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
                <svg
                  className={sizeClass}
                  viewBox="0 0 20 20"
                  fill={isActive ? activeColor : 'rgba(4,18,27,0.15)'}
                >
                  <path d={STAR_PATH} />
                </svg>
              </button>
            )
          })}
        {displayRating > 0 && (
          <span className="text-secondary ml-2 text-sm font-medium">
            {labels[displayRating]}
          </span>
        )}
      </div>
    </div>
  )
}

export default StarRating
