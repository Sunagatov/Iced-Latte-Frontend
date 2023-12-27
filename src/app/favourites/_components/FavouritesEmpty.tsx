'use client'

import Button from '@/components/ui/Button'
import Image from 'next/image'
import search from '../../../../public/search_cart.png'
import Link from 'next/link'

export default function FavouritesEmpty() {
  return (
    <div className="w-{800px} 1px h-{513px} mx-auto sm:w-[500px]">
      <h2 className="mx-4 my-6 text-4xl">Favourite Products</h2>
      <div className="mt-12 flex flex-col items-center ">
        <Image
          src={search}
          width={240}
          height={205}
          alt="search icon"
          priority
        />
        <div className=" mt-12  flex flex-col items-center gap-6 py-4">
          <p>Your favourites is empty</p>
          <Button className="h-14 w-[211px] text-lg font-medium">
            <Link href={'/'}>Continue Shopping</Link>
          </Button>
          <Button
            onClick={() => {}}
            className="h-14 w-[211px] text-lg font-medium"
          >
            Log in
          </Button>
        </div>
      </div>
    </div>
  )
}
