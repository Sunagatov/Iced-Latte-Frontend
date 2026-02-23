'use client'

import { FaStar } from 'react-icons/fa'
import FiltersGroupTitle from '@/features/products/components/FilterSidebar/FiltersGroupTitle'

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
    onChange(value === selectedOption ? null : value)
  }

  return (
    <div>
      <FiltersGroupTitle title="Rating" />
      <div className="flex flex-wrap gap-2">
        {stars.map((value) => (
          <button
            key={value}
            id={`checkbox-${value}`}
            aria-label={`Filter by ${value} stars`}
            onClick={() => handleCheckboxChange(value)}
            className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
              value === selectedOption
                ? 'border-brand-solid bg-brand-solid text-white'
                : 'border-black/10 bg-white text-primary hover:border-brand-solid hover:text-brand-solid'
            }`}
          >
            <FaStar className="h-3.5 w-3.5" color={value === selectedOption ? 'white' : '#00A30E'} />
            {value}+
          </button>
        ))}
        <button
          id="checkbox-any"
          aria-label="Filter by any number of stars"
          onClick={() => handleCheckboxChange('any')}
          className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
            selectedOption === 'any'
              ? 'border-brand-solid bg-brand-solid text-white'
              : 'border-black/10 bg-white text-primary hover:border-brand-solid hover:text-brand-solid'
          }`}
        >
          Any
        </button>
      </div>
    </div>
  )
}

export default ProductRatingFilter
