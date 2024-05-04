'use client'
import Image from 'next/image'
import { IProductFilterLabel } from '@/types/IProductFilterLabel'
import Button from '@/components/UI/Buttons/Button/Button'
import { twMerge } from 'tailwind-merge'

interface IProductsFilterLabels {
  filterLabels: IProductFilterLabel[]
  handleFilterByDefault: () => void
  handleFilterLabelClick: (label: string, id: string) => void
  className?: string
}

const ProductsFilterLabels = ({
  filterLabels,
  handleFilterLabelClick,
  handleFilterByDefault,
  className
}: Readonly<IProductsFilterLabels>) => {
  return (
    <div className={twMerge('justify-left flex flex-wrap gap-2 pt-1.5', className)}>
      <Button
        onClick={handleFilterByDefault}
        className="rounded-[40px] bg-inverted px-6 py-4"
        id="default-filter-btn"
      >
        By default
      </Button>

      {filterLabels.map(({ name, id, label }) => {
        const handleLabelClick = () => handleFilterLabelClick(name, id)

        return (
          <Button
            onClick={handleLabelClick}
            key={id}
            className="bg-inverted p-0"
            id={`filter-label-${id}`}
          >
            <div className="flex items-center gap-3 px-6 py-4">
              <Image
                width={11}
                height={11}
                src="cross.svg"
                alt={`Filter by ${label}`}
              />
              <span>{label}</span>
            </div>
          </Button>
        )
      })}
    </div>
  )
}

export default ProductsFilterLabels
