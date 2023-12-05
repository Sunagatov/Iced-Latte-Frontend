import Button from '@/components/ui/Button'
import CartElement from './CartElement'
import { useCombinedStore } from '@/store/store'
import { CartItem } from '@/store/cartSlice'
import Link from 'next/link'

export default function CartFull() {
  const { items, totalPrice, removeFullProduct, remove, add } =
    useCombinedStore()

  return (
    <div className="h-{513px} mx-auto flex min-w-[328px] flex-col px-4 md:max-w-[800px]">
      <h2 className="mx-4 my-6 text-left text-4xl">Shopping cart</h2>
      <div>
        {items.map((item: CartItem) => (
          <CartElement
            key={item.id}
            product={item}
            remove={remove}
            removeAll={removeFullProduct}
            add={add}
          />
        ))}
      </div>

      <div className="mt-4 flex justify-between font-semibold ">
        <p>Subtotal:</p>
        <p className="">${totalPrice.toFixed(2)}</p>
      </div>
      <div className="flex justify-center">
        <Button className="my-6 h-14 w-full text-lg font-medium sm:w-[211px]">
          <Link href={'/'}>Go to checkout</Link>
        </Button>
      </div>
    </div>
  )
}
