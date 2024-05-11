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
      className={twMerge('justify-left flex flex-wrap gap-2 pt-1.5', className)}
    >
      <Button
        onClick={handleFilterByDefault}
        className="rounded-[40px] bg-inverted px-6 py-4"
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
            className="h-[54px] rounded-[48px] bg-inverted p-0 text-L text-inverted transition ease-in-out"
            id={`filter-label-${value}`}
          >
            <div className="flex items-center gap-3 px-6 py-4">
              <button onClick={handleDeleteFilter}>
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
