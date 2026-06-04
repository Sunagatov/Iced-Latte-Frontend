'use client'
import Button from '@/shared/ui/Button'
import Counter from '@/shared/ui/Counter'
import { MAX_CART_ITEM_QUANTITY } from '@/features/cart/public'
import { useFavoriteProductActions } from '@/features/favorites/public'
import { IProduct } from '@/features/products/types'
interface Props {
  product: IProduct
}

export default function AddToCartButton({ product }: Readonly<Props>) {
  const {
    addToCart,
    decreaseCartQuantity,
    isCartPending,
    quantity,
    removeFromCart,
  } = useFavoriteProductActions(product.id)

  return (
    <>
      {!quantity && (
        <div data-testid="add-to-cart-btn">
          <Button
            id="add-btn"
            className="h-[42px] w-full px-4 font-semibold shadow-md hover:shadow-lg hover:brightness-110 md:h-[54px] md:w-[280px]"
            disabled={isCartPending}
            onClick={addToCart}
          >
            Add to cart
          </Button>
        </div>
      )}
      {quantity > 0 && (
        <Counter
          theme="dark"
          className="h-[42px] w-[110px] md:h-[48px] md:w-[120px]"
          count={quantity}
          disabled={isCartPending}
          maxCount={MAX_CART_ITEM_QUANTITY}
          addProduct={addToCart}
          removeProduct={
            quantity === 1 ? removeFromCart : decreaseCartQuantity
          }
        />
      )}
    </>
  )
}
