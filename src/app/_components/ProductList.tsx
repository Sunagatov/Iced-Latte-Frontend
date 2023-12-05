'use client'

import { useProducts } from '@/hooks/useProducts'
import ProductCard from './ProductCard'
import Loader from '@/components/ui/Loader'

export default function ProductList() {
  const { data, fetchNext, hasNextPage, isLoading, isFetchingNextPage, error } =
    useProducts()

  if (error) {
    console.log(error)

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
    <section className={'mb-5 mt-6 text-center min-[1124px]:mt-16'}>
      <div className={'inline-flex flex-col items-center text-left'}>
        <h1
          className={
            'mb-8 mr-auto text-5XL min-[1124px]:mb-10 min-[1124px]:text-6XL'
          }
        >
          All Coffee
        </h1>
        <ul
          className={
            'grid grid-cols-2 gap-x-[6px] gap-y-14 min-[1124px]:grid-cols-3 min-[1124px]:gap-x-8 min-[1124px]:gap-y-12'
          }
        >
          {data.map((product) => (
            <li key={product.id}>
              <ProductCard
                id={product.id}
                name={product.name}
                price={product.price}
                description={product.description}
              />
            </li>
          ))}
        </ul>
        {hasNextPage && !isFetchingNextPage && (
          <button
            className={
              ' mt-[24px] h-[54px] w-[145px] rounded-[46px] bg-secondary'
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
      </div>
    </section>
  )
}
