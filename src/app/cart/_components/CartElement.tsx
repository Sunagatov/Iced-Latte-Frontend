import React from 'react'
import Button from '@/components/ui/Button'
import Image from 'next/image'
import search from '../../../../public/search_cart.png'
import trash from '../../../../public/trash.svg'
import Counter from '@/app/product/_components/Counter'
import { CartItem } from '@/store/cartSlice'
import { productSize } from '@/constants/product'

interface CartElementProps {
  product: CartItem
  remove: (id: string) => void
  removeAll: (id: string) => void
}

export default function CartElement({
  product,
  remove,
  removeAll,
}: CartElementProps) {
  const { name, price } = product.info

  return (
    <div className="flex items-center justify-between border-b p-4">
      {/* Left side: Picture */}
      <div className="flex justify-center">
        <Image
          src={search}
          alt={product.info.name}
          width={100}
          height={100}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Right side: Data */}
      <div className="ml-4">
        <p className="text-lg font-semibold">{name}</p>
        <p>{` ${productSize}.`}</p>
        <p className="text-lg font-semibold">{`$${price.toFixed(2)}`}</p>
        <div className="flex justify-start">
          <Counter />
          <Button
            className=" bg-white"
            onClick={() => {
              removeAll(product.id)
            }}
          >
            <Image src={trash} width={24} height={24} alt="Logo" priority />
          </Button>
        </div>
      </div>
    </div>
  )
}
