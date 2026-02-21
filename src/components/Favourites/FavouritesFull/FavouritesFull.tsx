'use client'

import Link from 'next/link'
import FavElement from '../FavElement/FavElement'
import Loader from '@/components/UI/Loader/Loader'
import { IProduct } from '@/types/Products'
import { useFavouritesStore } from '@/store/favStore'

export default function FavouritesFull() {
  const { favourites, loading } = useFavouritesStore()

  const renderContent = () => {
    if (loading) {
      return <Loader />
    } else {

      return favourites.map((item: IProduct) => (
        <FavElement key={item.id} product={item} />
      ))
    }
  }

  return (
    <div className="mx-auto w-full max-w-[720px] px-4 pt-10 pb-16">
      <div className="mb-8 flex items-baseline gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Favourites</h1>
        <span className="text-sm font-medium text-tertiary">{favourites.length} items</span>
      </div>
      <div className="flex flex-col gap-3">
        {renderContent()}
      </div>
      {!loading && favourites.length > 0 && (
        <div className="mt-10 flex justify-center">
          <Link href={'/'}>
            <div className="flex h-[54px] w-[240px] items-center justify-center rounded-[48px] bg-brand-solid font-semibold text-inverted shadow-md transition-all duration-200 hover:brightness-110 hover:shadow-lg active:scale-95">
              Go to checkout
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}
