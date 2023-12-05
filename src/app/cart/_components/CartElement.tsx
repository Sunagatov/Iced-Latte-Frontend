import React from 'react'
import Button from '@/components/ui/Button'
import Image from 'next/image'
import productImg from '../../../../public/coffee.png'
import trash from '../../../../public/trash.svg'
import Counter from '@/components/ui/Counter'
import { CartItem } from '@/store/cartSlice'
import { productSize } from '@/constants/product'

interface CartElementProps {
  product: CartItem
  add: (item: CartItem) => void
  remove: (id: string) => void
  removeAll: (id: string) => void
}

export default function CartElement({
  product,
  add,
  remove,
  removeAll,
}: CartElementProps) {
  const { name, price, description } = product.info

  const addProduct = () => {
    add({
      id: product.id,
      info: {
        name,
        price,
        description,
        active: true,
        quantity: 40,
      },
      quantity: 1,
    })
  }

  return (
    <div className="flex items-center justify-between border-b p-4 pr-0">
      {/* Left side: Picture */}
      <div className="flex justify-center">
        <Image
          src={productImg}
          alt={product.info.name}
          width={100}
          height={100}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Right side: Data */}
      <div className="relative ml-4 grow">
        <p className="text-lg font-semibold">{name}</p>
        <p className={'font-medium text-placeholder'}>{` ${productSize} g.`}</p>
        <p className="right-0 top-0 text-lg font-semibold sm:absolute">{`$${price.toFixed(
          2,
        )}`}</p>
        <div className="mt-[22px] flex justify-start">
          <Counter
            theme="light"
            className={'h-[42px]'}
            count={product.quantity}
            removeProduct={() => remove(product.id)}
            addProduct={() => addProduct()}
          />
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
