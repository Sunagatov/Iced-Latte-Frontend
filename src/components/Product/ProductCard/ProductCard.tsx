import Image from 'next/image'
import Link from 'next/link'
import productImg from '../../../../public/coffee.png'
import CircleAddBtn from '../../UI/Buttons/CircleAddBtn/CircleAddBtn'
import getImgUrl from '@/utils/getImgUrl'
import ButtonHeart from '@/components/UI/Heart/ButtonHeart'
import { useCombinedStore } from '@/store/store'
import { useAuthStore } from '@/store/authStore'
import { useFavouritesStore } from '@/store/favStore'
import { ICardProps } from '@/types/ProductCard'
import { handleFavouriteButtonClick } from '@/utils/favUtils'
import ProductRating from '@/components/Product/ProductRating/ProductRating'
import Counter from '@/components/UI/Counter/Counter'

export default function ProductCard({ product }: Readonly<ICardProps>) {
  const {
    id,
    name,
    productFileUrl,
    price,
    averageRating,
    reviewsCount,
    brandName,
  } = product

  const cartItems = useCombinedStore((state) => state.itemsIds)
  const addToCart = useCombinedStore((state) => state.add)
  const removeFromCart = useCombinedStore((state) => state.remove)

  const productCartQuantity = cartItems?.find(
    (cartItem) => cartItem.productId === id,
  )?.productQuantity

  const token = useAuthStore((state) => state.token)

  const { addFavourite, removeFavourite, favourites, favouriteIds } =
    useFavouritesStore()

  const isInFavourites = favourites?.some((fav) => fav.id === id)

  const isActive = favouriteIds.includes(id)

  const handleButtonClick = async () => {
    await handleFavouriteButtonClick(
      id,
      token,
      isInFavourites,
      isActive,
      addFavourite,
      removeFavourite,
    )
  }

  return (
    <li
      className={
        'relative flex w-full max-w-[225px] flex-col justify-between justify-self-center rounded-lg border border-secondary transition-all hover:-translate-y-2 hover:shadow-[9px_9px_5px_0px_#D2D2D31A] sm:min-w-[178px]'
      }
    >
      <Link href={`/product/${id}`} className={'flex flex-col gap-y-4'}>
        <div className="relative aspect-[calc(225/188)] sm:h-[188px]">
          <Image
            className="rounded-t-lg"
            src={getImgUrl(productFileUrl, productImg)}
            alt="card picture"
            style={{ objectFit: 'cover' }}
            fill={true}
            sizes="(max-width: 768px) 100vw,
         (max-width: 1200px) 50vw,
         33vw"
            priority={true}
          />
        </div>
        <div className="flex flex-col gap-3.5 px-2.5 pb-3.5">
          <ProductRating rating={averageRating} reviewsCount={reviewsCount} />
          <div className={'flex w-full flex-col gap-1'}>
            <h2 className={'text-[12px] font-bold text-primary sm:text-L'}>
              {name}
            </h2>
            <p className="text-[10px] text-primary sm:text-XS">
              by {brandName}
            </p>
            <p className="text-[10px] text-secondary sm:text-XS">Iced latte</p>
          </div>
        </div>
      </Link>
      <hr className="h-[1px] w-full bg-secondary" />
      <div className={'flex items-center justify-between px-2.5 py-3.5'}>
        <p className={'text-M font-bold sm:text-L'}>${price}</p>
        {productCartQuantity ? (
          <Counter
            theme="light"
            className={'h-8 w-[84px] gap-2 text-[12px] sm:text-M'}
            count={productCartQuantity}
            removeProduct={() => removeFromCart(id, token)}
            addProduct={() => addToCart(id, token)}
          />
        ) : (
          <CircleAddBtn
            className="h-8 w-8 bg-brand-solid hover:bg-brand-solid-hover focus:bg-brand-solid active:bg-brand-solid sm:h-10 sm:w-10"
            iconClassName="h-3 w-3 sm:h-4 sm:w-4"
            onClick={() => {
              addToCart(id, token)
            }}
          />
        )}
      </div>
      <ButtonHeart
        active={token ? isInFavourites : isActive}
        onClick={handleButtonClick}
        className="absolute right-1 top-1 m-0 h-6 w-6 border-none bg-transparent p-1 sm:h-12 sm:w-12 sm:p-2"
      />
    </li>
  )
}
