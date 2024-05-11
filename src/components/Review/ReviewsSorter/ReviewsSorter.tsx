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
    <Dropdown
      id="reviewsDropdown"
      onChange={selectOption}
      options={reviewsSortOptions}
      selectedOption={selectedOption}
      className={twMerge('mb-10 mt-10', userReview ? 'xl:mt-20' : '')}
    />
  )
}

export default ReviewsSorter
