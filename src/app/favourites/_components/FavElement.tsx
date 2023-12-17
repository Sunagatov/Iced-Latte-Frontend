'use client'

import Image from 'next/image'
import productImg from '../../../../public/coffee.png'
import { IProduct } from '@/models/Products'

import { useCombinedStore } from '@/store/store'
import { useFavouritesStore } from '@/store/favStore'
import AddToCartButton from '@/components/ui/Button'
import ButtonHeart from '@/components/Heart/ButtonHeart'

interface FavElementProps {
  product: IProduct
}

export default function FavElement({ product }: FavElementProps) {
  const addToCart = useCombinedStore((state) => state.add)
  const { favouriteIds, addFavourite, removeFavourite } = useFavouritesStore()

  const isFavourite =
    favouriteIds && favouriteIds.some((favId) => favId === product.id)

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      info: {
        name: product.name,
        price: product.price,
        description: product.description,
        active: product.active,
        quantity: product.quantity,
      },
      quantity: 1,
    })
  }

  if (!isFavourite) {
    addFavourite(product.id)
  } else {
    removeFavourite(product.id)
  }

  const handleToggleFavourite = () => {
    try {
      if (!isFavourite) {
        addFavourite(product.id)
      } else {
        removeFavourite(product.id)
      }
    } catch (error) {
      console.error('Error toggling favourite:', error)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between border-b p-4 pr-0">
        <div className="w-27 flex justify-center">
          <Image
            src={productImg}
            alt={product.name}
            width={120}
            height={120}
            className=" object-cover"
          />
        </div>
        <div className="relative ml-4 grow">
          <p className="mb-2 text-lg font-semibold">{product.name}</p>
          <p
            className={'mb-5 font-medium text-placeholder'}
          >{` ${product.quantity} g.`}</p>
          <p className="right-0 top-0 text-lg font-semibold sm:absolute">{`$${product?.price?.toFixed(
            2,
          )}`}</p>

          <div className="flex">
            <AddToCartButton onClick={handleAddToCart} className="px-6">
              Add to Cart
            </AddToCartButton>
            <ButtonHeart active={isFavourite} onClick={handleToggleFavourite} />
          </div>
        </div>
      </div>
    </>
  )
}
