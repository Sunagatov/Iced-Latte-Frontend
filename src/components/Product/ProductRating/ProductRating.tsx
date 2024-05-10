import Image from 'next/image'
import { IProductRatingProps } from '@/types/ProductRating'
import Rating from '@/components/UI/Rating/Rating'

export default function ProductRating({
  rating,
  reviewsCount,
}: Readonly<IProductRatingProps>) {
  return (
    <>
      {rating ? (
        <>
          <Image
            src={'/star.png'}
            alt="star"
            className={'inline-block'}
            height={15}
            width={16}
          />
          <span>
            <Rating rating={rating} /> <span>({reviewsCount})</span>
          </span>
        </>
      ) : (
        <span className={'text-L text-tertiary'}>No rating</span>
      )}
    </>
  )
}
