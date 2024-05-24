'use client'

import { FaStar } from 'react-icons/fa'
import Checkbox from '@/components/UI/Checkbox/Checkbox'
import FiltersGroupTitle from '@/components/Product/FilterSidebar/FiltersGroupTitle'

export const stars = [4, 3, 2, 1]

export type StarsType = (typeof stars)[number]

interface IRatingFilter {
  onChange: (value: StarsType | 'any' | null) => void
  selectedOption: StarsType | null | 'any'
}

const ProductRatingFilter = ({
  onChange = () => {},
  selectedOption = null,
}: Readonly<IRatingFilter>) => {
  const handleCheckboxChange = (value: number | 'any') => {
    onChange(value)
  }

  return (
    <div>
      <FiltersGroupTitle title="Product rating" />
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
                isChecked={value === selectedOption}
                onChange={() => handleCheckboxChange(value)}
              />
              {stars}
              <span className="text-[18px] font-medium text-primary">& Up</span>
            </label>
          )
        })}
        <label className="relative flex cursor-pointer items-center gap-2">
          <Checkbox
            id={`checkbox-any`}
            ariaLabel={`Filter by any number of stars`}
            isChecked={selectedOption === 'any'}
            onChange={() => handleCheckboxChange('any')}
          />
          <span className="text-[18px] font-medium text-primary">Any</span>
        </label>
      </div>
    </div>
  )
}

export default ProductRatingFilter
