import Button from '@/components/UI/Buttons/Button/Button'
import Image from 'next/image'
import productImg from '../../../../public/coffee.png'
import trash from '../../../../public/trash.svg'
import getImgUrl from '@/utils/getImgUrl'
import Counter from '@/components/UI/Counter/Counter'
import Link from 'next/link'
import ButtonHeart from '@/components/UI/Heart/ButtonHeart'
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

  const productQuantity = items?.find(
    (item) => item.productId === productInfo.id,
  )!.productQuantity

  const totalProductPrice = (productInfo.price * productQuantity!).toFixed(2)

  const addProduct = () => {
    add()
  }

  const token = useAuthStore((state) => state.token)

  const { addFavourite, removeFavourite, favourites, favouriteIds } =
    useFavouritesStore()

  const isInFavourites = favourites?.some((fav) => fav.id === productInfo.id)
  const isActive = favouriteIds.includes(productInfo.id)

  const handleButtonClick = async () => {
    await handleFavouriteButtonClick(
      productInfo.id,
      token,
      isInFavourites,
      isActive,
      addFavourite,
      removeFavourite,
    )
  }

  return (
    <div className="flex h-[185px] items-center justify-between border-b p-4 pr-0">
      {/* Left side: Picture */}
      <div className="flex shrink-0 justify-center">
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
      <div className="relative ml-4 flex h-full grow flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="max-w-[40vw] truncate text-XL font-semibold min-[500px]:max-w-[45vw] sm:max-w-[50vw] md:max-w-[450px]">{`${productInfo.name}`}</p>
            <p
              className={'text-XS font-medium text-primary'}
            >{`${productInfo.brandName}`}</p>
            <p
              className={'text-XS font-medium text-secondary'}
            >{`by ${productInfo.sellerName}`}</p>
          </div>
          <div>
            <p className="text-lg font-semibold">{`$${totalProductPrice}`}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <p
              className={'text-L font-medium text-primary'}
            >{`$${productInfo.price}`}</p>
            <Button
              id="remove-all-btn"
              className=" bg-white"
              onClick={() => {
                removeAll()
              }}
            >
              <Image src={trash} width={24} height={24} alt="Logo" priority />
            </Button>
            <ButtonHeart
              active={token ? isInFavourites : isActive}
              onClick={handleButtonClick}
              className="m-0 h-9 w-9 p-2 sm:h-12 sm:w-12 sm:p-2"
            />
          </div>
          <Counter
            theme="light"
            className={'w-[90px] text-M sm:w-[120px] sm:text-2XL'}
            count={productQuantity!}
            removeProduct={() => remove()}
            addProduct={() => addProduct()}
          />
        </div>
      </div>
    </div>
  )
}
