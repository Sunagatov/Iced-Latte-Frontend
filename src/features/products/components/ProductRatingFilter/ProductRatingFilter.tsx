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
      <div className="flex flex-wrap gap-1.5">
        <button
          id="checkbox-any"
          onClick={() => onChange(null)}
          className={`rounded-full px-3 py-1 text-[13px] font-medium transition ${
            selectedOption === null
              ? 'bg-[#1B4332] text-white'
              : 'bg-black/[0.04] text-black/60 hover:bg-black/[0.07]'
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
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-[13px] font-medium transition ${
              value === selectedOption
                ? 'bg-[#1B4332] text-white'
                : 'bg-black/[0.04] text-black/60 hover:bg-black/[0.07]'
            }`}
          >
            <FaStar
              className="h-3 w-3"
              color={value === selectedOption ? 'white' : '#d97706'}
            />
            {value}+
          </button>
        ))}
      </div>
    </div>
  )
}

export default ProductRatingFilter
