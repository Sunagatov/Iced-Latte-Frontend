import Image from 'next/image'
import Link from 'next/link'
import cardLogo from '../../assets/images/card_logo.png'
import CircleAddBtn from './CircleAddBtn'
import star from '../../assets/images/star.png'
import { IProduct } from '@/models/Products'
import { productRating } from '@/constants/product'

type CardProps = Pick<IProduct, 'id' | 'name' | 'price'>

export default function ProductCard({ id, name, price }: CardProps) {
  return (
    <div className={'w-[360px] flex flex-col gap-y-4'}>
      <Link href={`/product/${id}`} className={'flex flex-col gap-y-4'}>
        <Image src={cardLogo} alt="card picture" />
        <div className={'w-full flex flex-col gap-3'}>
          <h2 className={'text-3xl font-bold text-primary'}>{name}</h2>
          <div className={'flex items-center gap-2'}>
            <Image src={star} alt="star" className={'inline-block'} />
            <span>{productRating}</span>
            <span className={'text-placeholder'}>&#x2022; 500 g.</span>
          </div>
        </div>
      </Link>

      <div className={'flex justify-between items-end'}>
        <p className={'text-2xl font-medium'}>${price}</p>
        <CircleAddBtn />
      </div>
    </div>
  )
}
