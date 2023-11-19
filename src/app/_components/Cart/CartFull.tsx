import Button from '@/components/ui/Button'
import CartElement from './CartElement'

export default function CartFull() {
  const items = [
    { id: 1, name: 'Coffee A', weight: '250g', price: 12.99 },
    { id: 2, name: 'Coffee B', weight: '500g', price: 19.99 },
    { id: 3, name: 'Coffee C', weight: '1kg', price: 29.99 },
  ]
  const subtotal = items.reduce((acc, item) => acc + item.price, 0)

  return (
    <div className="w-{800px} 1px h-{513px} mx-auto px-4 sm:w-[500px]">
      <h2 className="mx-4 my-6 text-left text-4xl">Shopping cart</h2>
      {items.map((item) => (
        <CartElement
          key={item.id}
          itemName={item.name}
          weight={item.weight}
          price={item.price}
        />
      ))}
      <div className="mt-4 flex justify-between font-semibold ">
        <p className="  ">Subtotal:</p>
        <p className="">${subtotal.toFixed(2)}</p>
      </div>
      <div className="flex justify-center">
        <Button className="h-14 w-[211px] text-lg font-medium">
          Continue Shopping
        </Button>
      </div>
    </div>
  )
}
