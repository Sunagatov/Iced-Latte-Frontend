import Image from 'next/image'
import Link from 'next/link'
import star from '../../../public/star.png'
import productImg from '../../../public/coffee.png'
import CircleAddBtn from './CircleAddBtn'
import { IProduct } from '@/models/Products'
import { productRating, productSize } from '@/constants/product'
import { useCombinedStore } from '@/store/store'
import { useAuthStore } from '@/store/authStore'
import ButtonHeart from '@/components/Heart/ButtonHeart'
import { useFavouritesStore } from '@/store/favStore'
import createImgUrl from '@/utils/createImgUrl'

type CardProps = Pick<IProduct, 'id' | 'name' | 'price' | 'description' | 'productFileUrl'>


export default function ProductCard({ id, name, price, productFileUrl }: Readonly<CardProps>) {

  const addToCart = useCombinedStore((state) => state.add)
  const token = useAuthStore((state) => state.token)
  const { addFavourite, removeFavourite, favouriteIds } = useFavouritesStore()
  const isActive = favouriteIds.includes(id)

  const handleButtonClick = async () => {
    try {
      if (isActive) {
        await removeFavourite(id, token)
      } else {
        await addFavourite(id, token)
      }
    } catch (error) {
      console.error('Error in handleButtonClick:', error)
    }
  }

  return (
    <div className={'relative flex w-[177px] flex-col gap-y-4 md:w-[360px]'}>
      <Link href={`/product/${id}`} className={'flex flex-col gap-y-4'}>
        <div
          className=' w-full h-[177px] md:h-[360px]  relative'>
          <Image
            src={createImgUrl(productFileUrl) ? productFileUrl! : productImg}
            alt="card picture"
            style={{ objectFit: 'cover' }}
            fill={true}
          />
        </div>

        <div className={'flex w-full flex-col gap-3'}>
          <h2 className={'text-L font-bold text-primary md:text-3XL'}>
            {name}
          </h2>
          <div className={' flex items-center gap-2 text-L md:text-2XL'}>
            <Image src={star} alt="star" className={'inline-block'} />
            <span>{productRating}</span>
            <span className={'text-placeholder'}>
              &#x2022; {productSize} g.
            </span>
          </div>
        </div>
      </Link>
      <div className={' absolute right-0 top-0'}>
        <ButtonHeart active={isActive} onClick={handleButtonClick} className="ml-2" />
      </div>
      <div className={'flex items-end justify-between'}>
        <p className={'text-XL font-medium md:text-2XL'}>${price}</p>
        <CircleAddBtn
          onClick={() => {
            addToCart(id, token)
          }}
        />
      </div>
    </div>
  )
}
