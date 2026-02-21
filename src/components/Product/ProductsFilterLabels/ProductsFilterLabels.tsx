'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Button from '@/components/UI/Buttons/Button/Button'
import { twMerge } from 'tailwind-merge'
import {
  defaultProductsFilters,
  useProductFiltersStore,
} from '@/store/productFiltersStore'

type FilterType = 'seller' | 'brand'
type FilterLabelItemType = {
  value: string
  filterType: FilterType
}

const buildFilterLabelItems = (
  brands: string[] = [],
  sellers: string[] = [],
): FilterLabelItemType[] => {
  const brandItems = brands.map(
    (brand) => ({ value: brand, filterType: 'brand' }) as FilterLabelItemType,
  )
  const sellerItems = sellers.map(
    (brand) => ({ value: brand, filterType: 'seller' }) as FilterLabelItemType,
  )

  return [...brandItems, ...sellerItems]
}

interface IProductsFilterLabels {
  className?: string
}

const ProductsFilterLabels = ({
  className,
}: Readonly<IProductsFilterLabels>) => {
  const {
    selectedBrandOptions,
    selectedSellerOptions,
    removeSellerOption,
    removeBrandOption,
    updateProductFiltersStore,
  } = useProductFiltersStore()

  const [filterLabels, setFilterLabels] = useState(() =>
    buildFilterLabelItems(selectedBrandOptions, selectedSellerOptions),
  )

  useEffect(() => {
    setFilterLabels(
      buildFilterLabelItems(selectedBrandOptions, selectedSellerOptions),
    )
  }, [selectedSellerOptions, selectedBrandOptions, setFilterLabels])

  const handleFilterByDefault = () => {
    updateProductFiltersStore(defaultProductsFilters)
  }

  return (
    <div
      className={twMerge('flex flex-nowrap gap-2 overflow-x-auto pb-1 pt-1.5 scrollbar-hide', className)}
    >
      <Button
        onClick={handleFilterByDefault}
        className="shrink-0 whitespace-nowrap rounded-[40px] border border-brand-solid bg-transparent px-6 py-4 text-L font-medium text-brand-solid transition hover:bg-brand-solid hover:text-white"
        id="default-filter-btn"
      >
        By default
      </Button>

      {filterLabels.map(({ value, filterType }) => {
        const handleDeleteFilter = () => {
          const removeFilterFunc =
            filterType === 'brand' ? removeBrandOption : removeSellerOption

          removeFilterFunc(value)
        }

        return (
          <div
            key={value}
            className="shrink-0 whitespace-nowrap rounded-[48px] border border-brand-solid p-0 text-L text-brand-solid transition ease-in-out"
            id={`filter-label-${value}`}
          >
            <div className="flex items-center gap-3 px-6 py-4">
              <button
                onClick={handleDeleteFilter}
                id={`remove-filter-${value}`}
              >
                <Image
                  width={11}
                  height={11}
                  src="cross.svg"
                  alt={`Filter by ${value}`}
                />
              </button>
              <span>{value}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ProductsFilterLabels
