import { useCombinedStore } from '@/store/store'

export default function DollarPrice() {
  const { totalPrice } = useCombinedStore()

  const formattedTotalPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(totalPrice || 0)

  console.log('Formatted Total Price:', formattedTotalPrice)

  return <span>{formattedTotalPrice}</span>
}
