'use client'

import Button from '@/components/ui/Button'
import Link from 'next/link'
import FavElement from './FavElement'
import Loader from '@/components/ui/Loader'
import { IProduct } from '@/models/Products'
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
    <div className="mx-auto flex min-w-[328px] flex-col px-4 md:max-w-[800px]">
      <h2 className="mx-4 my-6 text-left text-4xl">Favourite Products</h2>
      <div>
        {renderContent()}
      </div>
      <div className="flex w-full justify-center">
        <Link href={'/'}>
          <Button className="my-6 h-14  text-lg font-medium sm:w-[211px]">
            Go to checkout
          </Button>
        </Link>
      </div>
    </div>
  )
}
