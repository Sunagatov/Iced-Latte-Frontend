'use client'
import React from "react";
import {reviewsSortOptions} from "@/constants/reviewsSortOptions";
import {IOption} from "@/types/Dropdown";
import {IReviewsSortParams} from "@/types/IReviewsSortParams";
import Dropdown from "@/components/UI/Dropdown/Dropdown";

interface IReviewsSorter {
  selectedOption: IOption<IReviewsSortParams>
  selectOption: (option: IOption<IReviewsSortParams>) => void
}

const ReviewsSorter: React.FC<IReviewsSorter> = ({
  selectedOption,
  selectOption = () => {},
}) => {
  return (
    <>
      <Dropdown
        onChange={selectOption}
        options={reviewsSortOptions}
        selectedOption={selectedOption}
        className='mt-10 mb-10'
      />
    </>
  )
}

export default ReviewsSorter