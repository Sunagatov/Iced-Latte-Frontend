import { PriceProps } from '@/types/PriceType'

export default function Price({ amount }: Readonly<PriceProps>) {
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount || 0)

  return <span>{formattedPrice}</span>
}
