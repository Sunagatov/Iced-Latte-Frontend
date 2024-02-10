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
import { useCombinedStore } from '@/store/store'

export default function CartElement({
  product,
  add,
  remove,
  removeAll,
}: Readonly<CartElementProps>) {
  const { productInfo } = product

  console.log(product)

  const { count } = useCombinedStore()

  const addProduct = () => {
    add()
  }

  const token = useAuthStore((state) => state.token)

  const { addFavourite, removeFavourite, favouriteIds } = useFavouritesStore()
  const isActive = favouriteIds.includes(product.id)

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
            count={count}
            removeProduct={() => {
              if (count > 1) {
                remove()
              }
            }}
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
              active={isActive}
              onClick={handleButtonClick}
              className="ml-2"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
