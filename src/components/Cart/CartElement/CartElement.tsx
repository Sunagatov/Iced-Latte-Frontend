import Button from '@/components/UI/Buttons/Button/Button'
import Image from 'next/image'
import productImg from '../../../../public/coffee.png'
import trash from '../../../../public/trash.svg'
import getImgUrl from '@/utils/getImgUrl'
import Counter from '@/components/UI/Counter/Counter'
import Link from 'next/link'
import ButtonHeart from '@/components/UI/Heart/ButtonHeart'
import { productSize } from '@/constants/product'
import { useFavouritesStore } from '@/store/favStore'
import { useAuthStore } from '@/store/authStore'
import { CartElementProps } from '@/types/CartElement'
import { handleFavouriteButtonClick } from '@/utils/favUtils'
import { useCombinedStore } from '@/store/store'
import { useStoreData } from '@/hooks/useStoreData'

export default function CartElement({
  product,
  add,
  remove,
  removeAll,
}: Readonly<CartElementProps>) {
  const { productInfo } = product

  const items = useStoreData(useCombinedStore, (state) => state.itemsIds)

  const productQuantity = items?.find((item) => item.productId === productInfo.id)
    ?.productQuantity

  const addProduct = () => {
    add()
  }

  const token = useAuthStore((state) => state.token)

  const { addFavourite, removeFavourite, favourites, favouriteIds } = useFavouritesStore()

  const isInFavourites = favourites?.some((fav) => fav.id === productInfo.id)
  const isActive = favouriteIds.includes(productInfo.id)

  const handleButtonClick = async () => {
    await handleFavouriteButtonClick(productInfo.id, token, isInFavourites, isActive, addFavourite, removeFavourite)
  }

  return (
    <div className="flex items-center justify-between border-b p-4 pr-0">
      {/* Left side: Picture */}
      <div className="flex justify-center">
        <Link href={`/product/${productInfo.id}`}>
          <Image
            src={getImgUrl(productInfo.productFileUrl, productImg)}
            alt={productInfo.name}
            width={150}
            height={150}
          />
        </Link>
      </div>

      {/* Right side: Data */}
      <div className="relative ml-4 grow">
        <p className="text-lg font-semibold">{productInfo.name}</p>
        <p className={'font-medium text-placeholder'}>{` ${productSize} g.`}</p>
        <p className="right-0 top-0 text-lg font-semibold sm:absolute">{`$${productInfo.price.toFixed(
          2,
        )}`}</p>
        <div className="mt-[22px] flex justify-start">
          <Counter
            theme="light"
            className={'h-[42px]'}
            count={productQuantity!}
            removeProduct={
              () => {
                if (productQuantity! > 1) {
                  remove()
                }
              }
            }
            addProduct={() => addProduct()}
          />
          <Button
            className=" bg-white"
            onClick={() => {
              removeAll()
            }}
          >
            <Image src={trash} width={24} height={24} alt="Logo" priority />
          </Button>
          <div>
            <ButtonHeart
              active={token ? isInFavourites : isActive}
              onClick={handleButtonClick}
              className="ml-2"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
