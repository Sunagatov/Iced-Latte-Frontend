'use client'
import React from 'react'
import { reviewsSortOptions } from '@/features/reviews/constants'
import Dropdown from '@/shared/components/Dropdown/Dropdown'
import { IOption } from '@/shared/types/Dropdown'
import { ISortParams } from '@/shared/types/ISortParams'
import { Review } from '@/features/reviews/types'
import { twMerge } from 'tailwind-merge'

interface IReviewsSorter {
  selectedOption: IOption<ISortParams>
  selectOption: (option: IOption<ISortParams>) => void
  userReview: Review | null
}

const ReviewsSorter: React.FC<IReviewsSorter> = ({
  selectedOption,
  selectOption = () => {},
  userReview,
}) => {
  return (
    <div className={twMerge('flex items-center gap-3 border-b border-primary/40 pb-4 mb-6 mt-8', userReview ? 'xl:mt-10' : '')}>
      <span className="text-sm font-medium text-tertiary">Sort by</span>
      <Dropdown
        id="reviewsDropdown"
        onChange={selectOption}
        options={reviewsSortOptions}
        selectedOption={selectedOption}
        hidePrefix
      />
    </div>
  )
}

export default ReviewsSorter
