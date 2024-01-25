import Button from '@/components/UI/Buttons/Button/Button'
import CartElement from '../CartElement/CartElement'
import { useCombinedStore } from '@/store/store'
import Link from 'next/link'
import { ICartItem } from '@/types/Cart'
import { useAuthStore } from '@/store/authStore'

export default function CartFull() {
  const { tempItems, totalPrice, removeFullProduct, remove, add } =
    useCombinedStore()
  const { token } = useAuthStore()

  return (
    <div className="h-{513px} mx-auto flex min-w-[328px] flex-col px-4 md:max-w-[800px]">
      <h2 className="mx-4 my-6 text-left text-4xl">Shopping cart</h2>
      <div>
        {tempItems.map((item: ICartItem) => (
          <CartElement
            key={item.id}
            product={item}
            remove={() => remove(item.productInfo.id, token)}
            removeAll={() => removeFullProduct(item.productInfo.id, token)}
            add={() => add(item.productInfo.id, token)}
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
