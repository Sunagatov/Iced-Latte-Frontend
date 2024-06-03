'use client'
import { FaStar } from 'react-icons/fa'
import Checkbox from '@/components/UI/Checkbox/Checkbox'
import { useProductReviewsStore } from '@/store/reviewsStore'
import Rating from '@/components/UI/Rating/Rating'

interface ReviewRatingFilterProps {
  onChange: (value: number) => void
  selectedOptions: Array<number>
}

const stars: Array<5 | 4 | 3 | 2 | 1> = [5, 4, 3, 2, 1]

const ReviewRatingFilter = ({
  onChange,
  selectedOptions = [],
}: ReviewRatingFilterProps) => {
  const { reviewsStatistics } = useProductReviewsStore()

  const handleCheckboxChange = (value: number) => {
    onChange(value)
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4">
        <div className="text-4XL font-medium text-primary">
          {/* Convert avgRating to number, default to 0 if NaN */}
          <Rating rating={parseFloat(reviewsStatistics?.avgRating ?? '') || 0} />
        </div>
        <div className="text-L font-medium text-tertiary">
          Based on {reviewsStatistics?.reviewsCount ?? 0} reviews
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {stars.map((value) => {
          const stars = Array.from({ length: 5 }, (_, index) => (
            <FaStar
              className="h-6 w-6"
              key={index}
              color={index < value ? '#00A30E' : 'rgba(4, 18, 27, 0.24)'}
            />
          ))

          return (
            <label
              key={value}
              className="relative flex cursor-pointer items-center gap-2"
            >
              <Checkbox
                id={`checkbox-${value}`}
                ariaLabel={`Filter by ${value} stars`}
                isChecked={selectedOptions.includes(value)}
                onChange={() => handleCheckboxChange(value)}
              />
              {stars}
              <span className="text-[18px] font-medium text-primary">
                {reviewsStatistics?.ratingMap[`star${value}`]} reviews
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )
}

export default ReviewRatingFilter
