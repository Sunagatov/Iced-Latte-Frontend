import { IRatingProps } from '@/types/RatingType'

export default function Rating({ rating }: Readonly<IRatingProps>) {
  const formattedRating = new Intl.NumberFormat('ru', {
    style: 'decimal',
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(rating ?? 0)

  return <span>{formattedRating}</span>
}
