import { IRatingProps } from '@/types/RatingType'

export default function Rating({ rating }: Readonly<IRatingProps>) {
  const numberRating = rating
    ? typeof rating === 'number'
      ? rating
      : parseFloat(rating || '0')
    : 0

  const formattedRating = new Intl.NumberFormat('ru', {
    style: 'decimal',
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(numberRating)

  return <span>{formattedRating}</span>
}
