'use client'
import React from 'react'
import { reviewsSortOptions } from '@/constants/reviewsSortOptions'
import Dropdown from '@/components/UI/Dropdown/Dropdown'
import { IOption } from '@/types/Dropdown'
import { ISortParams } from '@/types/ISortParams'

interface IReviewsSorter {
  selectedOption: IOption<ISortParams>
  selectOption: (option: IOption<ISortParams>) => void
}

const ReviewsSorter: React.FC<IReviewsSorter> = ({
  selectedOption,
  selectOption = () => {},
}) => {
  return (
    <Dropdown
      id="reviewsDropdown"
      onChange={selectOption}
      options={reviewsSortOptions}
      selectedOption={selectedOption}
      className="mb-10 mt-10"
    />
  )
}

export default ReviewsSorter
