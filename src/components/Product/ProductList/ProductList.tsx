'use client'
import { useState } from 'react'
import { useProducts } from '@/hooks/useProducts'
import { sortOptions } from '@/constants/productSortOptions'
import ProductCard from '@/components/Product/ProductCard/ProductCard'
import Loader from '@/components/UI/Loader/Loader'
import Dropdown from '@/components/UI/Dropdown/Dropdown'
import ScrollUpBtn from '@/components/UI/Buttons/ScrollUpBtn/ScrollUpBtn'
import { IOption } from '@/types/Dropdown'
import ProductsFilterLabels from '@/components/Product/ProductsFilterLabels/ProductsFilterLabels'
import { IProductFilterLabel } from '@/types/IProductFilterLabel'
import { twMerge } from 'tailwind-merge'
import { ProductSortLabel, ProductSortValue } from '@/types/ProductSortParams'

function getDefaultSortOption(label: ProductSortLabel) {
  return sortOptions.filter((sortOption) => sortOption.label === label)[0]
}

// @NOTE: need to delete when backend will be ready
const _filterLabelsMock: IProductFilterLabel[] = [
  { id: '1', name: 'name-1', label: 'Brand1' },
  { id: '2', name: 'name-2', label: 'Seller1' },
  { id: '3', name: 'name-3', label: 'Seller5' },
]

export default function ProductList() {
  const handleFilterByDefault = () => {
    console.log(`Button 'By default' clicked`)
  }

  const handleFilterLabelClick = (name: string, id: string) => {
    console.log(`Label: ${name} id: ${id}`)
  }

  const [selectedSortOption, setSelectedSortOption] = useState<
    IOption<ProductSortValue>
  >(() => getDefaultSortOption('Best Sellers'))

  const { data, fetchNext, hasNextPage, isLoading, isFetchingNextPage, error } =
    useProducts(selectedSortOption)

  function handleSelect(selectedOption: IOption<ProductSortValue>) {
    setSelectedSortOption(selectedOption)
  }

  const isShowLoadMoreBtn = hasNextPage && !isFetchingNextPage

  if (error) {
    return (
      <h1 className={'grid h-screen  place-items-center text-4xl text-black'}>
        Something went wrong!
      </h1>
    )
  }

  if (isLoading) {
    return (
      <div className={'mt-14 flex h-[54px] items-center justify-center'}>
        <Loader />
      </div>
    )
  }

  return (
    <section
      className={twMerge(
        'mt-5 text-center min-[1124px]:mt-16',
        !isShowLoadMoreBtn ? 'mb-14' : '',
      )}
    >
      <div className={'inline-flex flex-col items-center text-left '}>
        <h1
          className={
            'mb-8 mr-auto text-5XL min-[1124px]:mb-10 min-[1124px]:text-6XL'
          }
        >
          All Coffee
        </h1>
        <div className={'flex w-full justify-between'}>
          <ProductsFilterLabels
            filterLabels={_filterLabelsMock}
            handleFilterLabelClick={handleFilterLabelClick}
            handleFilterByDefault={handleFilterByDefault}
          />
          <Dropdown<ProductSortValue>
            className={'mb-8'}
            options={sortOptions}
            onChange={handleSelect}
            selectedOption={selectedSortOption}
          />
        </div>
        <ul
          className={
            'grid grid-cols-2 gap-x-2 gap-y-7 sm:gap-x-8 min-[1124px]:grid-cols-3 '
          }
        >
          {data.map((product) => (
            <li key={product.id}>
              <ProductCard
                id={product.id}
                name={product.name}
                price={product.price}
                description={product.description}
                productFileUrl={product.productFileUrl}
              />
            </li>
          ))}
        </ul>
        {isShowLoadMoreBtn && (
          <button
            className={
              'm-3 mt-[24px] h-[54px] w-[145px] rounded-[46px] bg-secondary'
            }
            onClick={() => {
              fetchNext().catch((e) => console.log(e))
            }}
          >
            Show more
          </button>
        )}
        {isFetchingNextPage && (
          <div className={'mt-[24px] flex h-[54px] items-center'}>
            <Loader />
          </div>
        )}
        <ScrollUpBtn />
      </div>
    </section>
  )
}
