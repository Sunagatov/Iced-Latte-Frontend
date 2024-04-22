'use client'
import Image from 'next/image'
import { IProductFilterLabel } from '@/types/IProductFilterLabel'
import Button from '@/components/UI/Buttons/Button/Button'


interface IProductsFilterLabels {
  filterLabels: IProductFilterLabel[]
  handleFilterByDefault: () => void
  handleFilterLabelClick: (label: string, id: string) => void
}

const ProductsFilterLabels = ({ filterLabels, handleFilterLabelClick, handleFilterByDefault }: Readonly<IProductsFilterLabels>) => {
  return (
    <div className="flex gap-2 pt-1.5 flex-wrap justify-left">
      <Button
        onClick={handleFilterByDefault} className="px-7 bg-inverted rounded-[40px]"
        id='default-filter-btn'
      >
        By default
      </Button>

      {filterLabels.map(({ name, id, label }) => {
        const handleLabelClick = () => handleFilterLabelClick(name, id)

        return (
          <Button
            onClick={handleLabelClick}
            key={id}
            className="bg-inverted flex items-center gap-3 px-7"
            id={`filter-label-${id}`}
          >
            <Image width={11} height={11} src='cross.svg' alt={`Filter by ${label}`}/>
            <span>{label}</span>
          </Button>
        )
      })}
    </div>
  )
}

export default ProductsFilterLabels