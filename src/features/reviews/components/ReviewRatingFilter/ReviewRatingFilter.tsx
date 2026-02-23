'use client'
import { FaStar } from 'react-icons/fa'
import Checkbox from '@/shared/components/Checkbox/Checkbox'
import { useProductReviewsStore } from '@/features/reviews/store'
import Rating from '@/shared/components/Rating/Rating'

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
    <div className="rounded-2xl border border-primary/60 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-1">
        <div className="text-5xl font-bold tracking-tight text-primary">
          <Rating rating={reviewsStatistics?.avgRating} />
        </div>
        <div className="text-sm text-tertiary">
          Based on {reviewsStatistics?.reviewsCount ?? 0} reviews
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {stars.map((value) => {
          const count = reviewsStatistics?.ratingMap[`star${value}`] ?? 0
          const total = reviewsStatistics?.reviewsCount ?? 0
          const pct = total > 0 ? Math.round((count / total) * 100) : 0
          const isChecked = selectedOptions.includes(value)

          return (
            <label
              key={value}
              className={`flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 transition-colors ${
                isChecked ? 'bg-brand-second' : 'hover:bg-secondary'
              }`}
            >
              <Checkbox
                id={`checkbox-${value}`}
                ariaLabel={`Filter by ${value} stars`}
                isChecked={isChecked}
                onChange={() => handleCheckboxChange(value)}
              />
              <span className="w-3 text-right text-sm font-semibold text-primary">{value}</span>
              <FaStar className="h-4 w-4 text-positive" />
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-positive transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-6 text-right text-xs text-tertiary">{count}</span>
            </label>
          )
        })}
      </div>
    </div>
  )
}

export default ReviewRatingFilter
