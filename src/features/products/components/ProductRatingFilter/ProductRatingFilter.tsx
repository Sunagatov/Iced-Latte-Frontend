'use client'

import { FaStar } from 'react-icons/fa'
import FiltersGroupTitle from '@/features/products/components/FilterSidebar/FiltersGroupTitle'

export const stars = [5, 4, 3, 2, 1] as const

export type StarsType = (typeof stars)[number]

interface IRatingFilter {
  onChange: (value: StarsType | null) => void
  selectedOption: StarsType | null
}

const ProductRatingFilter = ({
  onChange = () => {},
  selectedOption = null,
}: Readonly<IRatingFilter>) => {
  const handleCheckboxChange = (value: number) => {
    onChange(value === selectedOption ? null : (value as StarsType))
  }

  return (
    <div>
      <FiltersGroupTitle title="Rating" />
      <div className="flex flex-wrap gap-2">
        <button
          id="checkbox-any"
          onClick={() => onChange(null)}
          className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
            selectedOption === null
              ? 'border-brand-solid bg-brand-solid text-white'
              : 'text-primary hover:border-brand-solid hover:text-brand-solid border-black/10 bg-white'
          }`}
        >
          Any
        </button>
        {stars.map((value) => (
          <button
            key={value}
            id={`checkbox-${value}`}
            aria-label={`Filter by ${value} stars`}
            onClick={() => handleCheckboxChange(value)}
            className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
              value === selectedOption
                ? 'border-brand-solid bg-brand-solid text-white'
                : 'text-primary hover:border-brand-solid hover:text-brand-solid border-black/10 bg-white'
            }`}
          >
            <FaStar
              className="h-3.5 w-3.5"
              color={value === selectedOption ? 'white' : '#00A30E'}
            />
            {value}+
          </button>
        ))}
      </div>
    </div>
  )
}

export default ProductRatingFilter
