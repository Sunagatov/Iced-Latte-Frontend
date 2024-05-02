import { IProductRatingProps } from '@/types/ProductRating'

export default function ProductRating({
  amount,
  reviewsCount,
}: Readonly<IProductRatingProps>) {
  const formattedRating = new Intl.NumberFormat('ru', {
    style: 'decimal',
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(amount)

  return (
    <span>
      <span>{formattedRating}</span> <span>({reviewsCount})</span>
    </span>
  )
}
