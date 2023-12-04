import Button from '@/components/ui/Button'
import CartElement from './CartElement'
import { useCombinedStore } from '@/store/store'

export default function CartFull() {
  const { items, totalPrice, removeFullProduct } = useCombinedStore()

  return (
    <div className="w-{800px} 1px h-{513px} mx-auto px-4 sm:w-[500px]">
      <h2 className="mx-4 my-6 text-left text-4xl">Shopping cart</h2>
      {items.map((item: CartItem) => (
        <CartElement
          key={item.id}
          itemName={item.name}
          weight={item.weight}
          price={item.price}
          remove={() => removeFullProduct(item.id)}
        />
      ))}
      <div className="mt-4 flex justify-between font-semibold ">
        <p className="  ">Subtotal:</p>
        <p className="">${totalPrice.toFixed(2)}</p>
      </div>
      <div className="flex justify-center">
        <Button className="h-14 w-[211px] text-lg font-medium">
          Continue Shopping
        </Button>
      </div>
    </div>
  )
}
