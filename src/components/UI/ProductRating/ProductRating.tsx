import { ProductRatingProps } from '@/types/ProductRating'

export default function ProductRating({
  amount,
}: Readonly<ProductRatingProps>) {
  const formattedRating = new Intl.NumberFormat('ru', {
    style: 'decimal',
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(amount)

  return <span>{formattedRating}</span>
}
