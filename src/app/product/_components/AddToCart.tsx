'use client'

import Button from '@/components/ui/Button'
import { IProduct } from '@/models/Products'
import Counter from './Counter'
import { useState } from 'react'

type Props = {
  product: IProduct
}

export default function AddToCartButton({ product }: Props) {
  const [isAddingStarted, setAddingStarted] = useState(false)

  const addToCart = () => {
    // logic for adding to cart
  }
  const removeFromCart = () => {
    // logic for removing product from cart
  }

  return (
    <>
      {!isAddingStarted && (
        <Button
          className={'w-full md:w-[278px]'}
          onClick={() => {
            addToCart()
            setAddingStarted(true)
          }}
        >
          Add to cart &#x2022; ${product.price}
        </Button>
      )}
      {isAddingStarted && (
        <div className="flex items-center gap-2 sm:mx-auto md:mx-0">
          <Counter
            addProductToCart={addToCart}
            cancelAdding={() => {
              removeFromCart()
              setAddingStarted(false)
            }}
          />
          <Button className={'w-[123px] cursor-default hover:bg-brand-solid'}>
            ${product.price}
          </Button>
        </div>
      )}
    </>
  )
}
