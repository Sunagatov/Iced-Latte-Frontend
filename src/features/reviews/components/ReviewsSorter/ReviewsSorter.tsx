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
  children?: React.ReactNode
}

const ReviewsSorter: React.FC<
  IReviewsSorter & { children?: React.ReactNode }
> = ({ selectedOption, selectOption = () => {}, userReview, children }) => {
  return (
    <div
      className={twMerge(
        'border-primary/40 mt-8 mb-6 flex items-center gap-2 border-b pb-4',
        userReview ? 'xl:mt-10' : '',
      )}
    >
      <Dropdown
        id="reviewsDropdown"
        onChange={selectOption}
        options={reviewsSortOptions}
        selectedOption={selectedOption}
        hidePrefix
      />
      {children}
    </div>
  )
}

export default ReviewsSorter
