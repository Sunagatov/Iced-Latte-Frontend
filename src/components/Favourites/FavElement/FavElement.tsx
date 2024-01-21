'use client'
import Image from 'next/image'
import productImg from '../../../../public/coffee.png'
import star from '../../../../public/star.png'
import ButtonHeart from '@/components/UI/Heart/ButtonHeart'
import Link from 'next/link'
import Button from '@/components/UI/Buttons/Button/Button'
import createImgUrl from '@/utils/createImgUrl'
import { productRating } from '@/constants/product'
import { useAuthStore } from '@/store/authStore'
import { useCombinedStore } from '@/store/store'
import { useFavouritesStore } from '@/store/favStore'
import { FavElementProps } from '@/types/FavElement'

export default function FavElement({ product }: Readonly<FavElementProps>) {
  const { addFavourite, removeFavourite, favouriteIds } = useFavouritesStore()
  const isActive = favouriteIds.includes(product.id)
  const { add } =
    useCombinedStore()
  const { token } = useAuthStore()
  const addToCart = () => {
    add(product.id, token)
  }

  const handleButtonClick = async () => {
    try {
      if (isActive) {
        await removeFavourite(product.id, token)
      } else {
        await addFavourite(product.id, token)
      }
    } catch (error) {
      console.error('Error in handleButtonClick:', error)
    }
  }

  return (
    <div className="flex items-center justify-between border-b p-4 pr-0">

      <Link href={`/product/${product.id}`} className="flex justify-center">
        <Image
          src={createImgUrl(product.productFileUrl) ? product.productFileUrl! : productImg}
          alt={product.name}
          width={200}
          height={200}
          className=" object-cover"
        />
      </Link>

      <div className="relative ml-4 grow">
        <p className="text-lg font-semibold">{product.name}</p>
        <p
          className={'mb-4 font-medium text-placeholder'}
        >{` ${product.quantity} g.`}</p>

        <p className="right-0 top-0 mb-2 text-lg font-semibold sm:absolute">{`$${product?.price?.toFixed(
          2,
        )}`}</p>
        <div className="mb-3">
          <Image src={star} alt="star" className={'inline-block'} />

          <span>{productRating}</span>
        </div>
        <div className="flex">
          <Button onClick={addToCart} className={'mr-2'}>Add to cart</Button>
          <ButtonHeart active={isActive} onClick={handleButtonClick} className="ml-2" />
        </div>
      </div>
    </div>
  )
}