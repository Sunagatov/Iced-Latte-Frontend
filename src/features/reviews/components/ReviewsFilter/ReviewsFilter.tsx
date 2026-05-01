'use client'

import { FaStar } from 'react-icons/fa'
import type { IProductReviewsStatistics } from '@/features/reviews/types'

interface ReviewsFilterProps {
  filterRef: React.RefObject<HTMLDivElement | null>
  reviewsStatistics: IProductReviewsStatistics
  selectedFilterRating: number[]
  showFilterDropdown: boolean
  setShowFilterDropdown: React.Dispatch<React.SetStateAction<boolean>>
  toggleRatingFilter: (value: number) => void
  clearRatingFilters: () => void
}

export default function ReviewsFilter({
  filterRef,
  reviewsStatistics,
  selectedFilterRating,
  showFilterDropdown,
  setShowFilterDropdown,
  toggleRatingFilter,
  clearRatingFilters,
}: Readonly<ReviewsFilterProps>) {
  return (
    <div ref={filterRef} className="relative">
      <button
        onClick={() => setShowFilterDropdown((value) => !value)}
        className={`flex items-center gap-1.5 rounded-[40px] border-2 px-5 py-3 text-base font-medium transition-all duration-200 active:scale-95 ${
          showFilterDropdown || selectedFilterRating.length > 0
            ? 'border-brand-solid bg-secondary text-primary'
            : 'bg-secondary text-primary hover:bg-tertiary border-transparent'
        }`}
      >
        Filter
        {selectedFilterRating.length > 0 && (
          <span className="bg-brand-solid flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white">
            {selectedFilterRating.length}
          </span>
        )}
        <FaStar className="text-positive h-3 w-3" />
      </button>
      {showFilterDropdown && (
        <div className="border-primary bg-primary absolute top-[calc(100%+8px)] right-0 z-10 w-56 rounded-xl border shadow-xl">
          <div className="flex flex-col gap-0.5 p-2">
            {[5, 4, 3, 2, 1].map((value) => {
              const count = reviewsStatistics.ratingMap[`star${value}`] ?? 0
              const total = reviewsStatistics.reviewsCount ?? 0
              const width = total > 0 ? Math.round((count / total) * 100) : 0
              const isChecked = selectedFilterRating.includes(value)

              return (
                <button
                  key={value}
                  onClick={() => toggleRatingFilter(value)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isChecked
                      ? 'bg-brand-second font-semibold'
                      : 'hover:bg-tertiary'
                  }`}
                >
                  <span className="text-primary w-3 text-right font-semibold">
                    {value}
                  </span>
                  <FaStar className="text-positive h-3.5 w-3.5 shrink-0" />
                  <div className="bg-secondary h-1.5 flex-1 overflow-hidden rounded-full">
                    <div
                      className="bg-positive h-full rounded-full transition-all duration-300"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <span className="text-tertiary w-5 text-right text-xs">
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
          {selectedFilterRating.length > 0 && (
            <div className="border-primary/10 border-t px-3 py-2">
              <button
                onClick={clearRatingFilters}
                className="text-brand text-xs font-medium hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
