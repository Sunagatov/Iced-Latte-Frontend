import React from 'react'
import Button from '@/components/ui/Button'
import Image from 'next/image'
import search from '../../../../public/search_cart.png'
import trash from '../../../../public/trash.svg'
import Counter from '@/app/product/_components/Counter'

interface CartElementProps {
  itemName: string
  weight: string
  price: number
  remove: () => void
}

export default function CartElement({
  itemName,
  weight,
  price,
  remove,
}: CartElementProps) {
  return (
    <div className="flex items-center justify-between border-b p-4">
      {/* Left side: Picture */}
      <div className="flex justify-center">
        <Image
          src={search}
          alt={itemName}
          width={100}
          height={100}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Right side: Data */}
      <div className="ml-4">
        <p className="text-lg font-semibold">{itemName}</p>
        <p>{` ${weight}.`}</p>
        <p className="text-lg font-semibold">{`$${price.toFixed(2)}`}</p>
        <div className="flex justify-start">
          <Counter />
          <Button className=" bg-white" onClick={remove}>
            <Image src={trash} width={24} height={24} alt="Logo" priority />
          </Button>
        </div>
      </div>
    </div>
  )
}
