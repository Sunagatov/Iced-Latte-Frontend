'use client'

import Button from '@/components/ui/Button'
import FavElement from './FavElement'

import { IProduct } from '@/models/Products'
import Link from 'next/link'
import { useFavouritesStore } from '@/store/favStore'

export default function FavouritesFull() {
  const { favourites } = useFavouritesStore()

  return (
    <div className="mx-auto flex h-[513px] min-w-[328px] flex-col px-4 md:max-w-[800px]">
      <h2 className="mx-4 my-6 text-left text-4xl">Favourites</h2>
      <div>
        {favourites.map((item: IProduct) => (
          <FavElement key={item.id} product={item} />
        ))}
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
