'use client'

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
              ? 'bg-brand-solid text-white'
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
                ? 'bg-brand-solid text-white'
                : 'bg-black/[0.04] text-black/60 hover:bg-black/[0.07]'
            }`}
          >
            <svg className="h-3 w-3" viewBox="0 0 20 20" fill={value === selectedOption ? 'white' : '#d97706'}>
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {value}+
          </button>
        ))}
      </div>
    </div>
  )
}

export default ProductRatingFilter
