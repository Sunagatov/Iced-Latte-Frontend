'use client'
import Button from '@/components/UI/Buttons/Button/Button'
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
          <span>It is empty. </span><span className=" font-bold text-lg">Fill it with your favourite products.</span>
          <Link href={'/'}>
            <Button className="h-14 w-[211px] text-lg font-medium">
              Continue Shopping
            </Button>
          </Link>
          <Button
            onClick={() => { }}
            className="h-14 w-[211px] text-lg font-medium"
          >
            Log in
          </Button>
        </div>
      </div>
    </div>
  )
}
