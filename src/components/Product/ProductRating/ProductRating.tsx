import Image from 'next/image'
import { IProductRatingProps } from '@/types/ProductRating'

export default function ProductRating({
  rating,
  reviewsCount,
}: Readonly<IProductRatingProps>) {
  const formattedRating = new Intl.NumberFormat('ru', {
    style: 'decimal',
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(rating ?? 0)

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
            <span>{formattedRating}</span> <span>({reviewsCount})</span>
          </span>
        </>
      ) : (
        <span className={'text-L text-tertiary'}>No rating</span>
      )}
    </>
  )
}
