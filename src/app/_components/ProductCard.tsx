import Image from 'next/image'
import Link from 'next/link'
import star from '../../../public/star.png'
import cardLogo from '../../../public/card_logo.png'
import CircleAddBtn from './CircleAddBtn'
import { IProduct } from '@/models/Products'
import { productRating, productSize } from '@/constants/product'
import { useCombinedStore } from '@/store/store'

type CardProps = Pick<IProduct, 'id' | 'name' | 'price' | 'description'>

export default function ProductCard({
  id,
  name,
  price,
  description,
}: CardProps) {
  const addToCart = useCombinedStore((state) => state.add)

  return (
    <div className={'flex w-[177px] flex-col gap-y-4 md:w-[360px]'}>
      <Link href={`/product/${id}`} className={'flex flex-col gap-y-4'}>
        <Image src={cardLogo} alt="card picture" />
        <div className={'flex w-full flex-col gap-3'}>
          <h2 className={'text-L font-bold text-primary md:text-3XL'}>
            {name}
          </h2>
          <div className={'flex items-center gap-2 text-L md:text-2XL'}>
            <Image src={star} alt="star" className={'inline-block'} />
            <span>{productRating}</span>
            <span className={'text-placeholder'}>
              &#x2022; {productSize} g.
            </span>
          </div>
        </div>
      </Link>

      <div className={'flex items-end justify-between'}>
        <p className={'text-XL font-medium md:text-2XL'}>${price}</p>
        <CircleAddBtn
          onClick={() => {
            addToCart({
              id,
              info: {
                name,
                price,
                description,
                active: true,
                quantity: 40,
              },
              quantity: 1,
            })
          }}
        />
      </div>
    </div>
  )
}
