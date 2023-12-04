import Button from '@/components/ui/Button'
import CartElement from './CartElement'
import { useCombinedStore } from '@/store/store'
import { CartItem } from '@/store/cartSlice'
import Link from 'next/link'

export default function CartFull() {
  const { items, totalPrice, removeFullProduct, remove } = useCombinedStore()

  return (
    <div className="w-{800px} 1px h-{513px} mx-auto px-4 sm:w-[500px]">
      <h2 className="mx-4 my-6 text-left text-4xl">Shopping cart</h2>
      {items.map((item: CartItem) => (
        <CartElement
          key={item.id}
          product={item}
          remove={remove}
          removeAll={removeFullProduct}
        />
      ))}
      <div className="mt-4 flex justify-between font-semibold ">
        <p>Subtotal:</p>
        <p className="">${totalPrice.toFixed(2)}</p>
      </div>
      <div className="flex justify-center">
        <Button className="h-14 w-[211px] text-lg font-medium">
          <Link href={'/'}>Go to checkout</Link>
        </Button>
      </div>
    </div>
  )
}
