'use client'
import React from 'react'
import { reviewsSortOptions } from '@/constants/reviewsSortOptions'
import Dropdown from '@/components/UI/Dropdown/Dropdown'
import { IOption } from '@/types/Dropdown'
import { ISortParams } from '@/types/ISortParams'
import { Review } from '@/types/ReviewType'
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
