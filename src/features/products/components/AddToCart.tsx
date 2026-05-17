'use client'
import { useCallback } from 'react'
import Button from '@/shared/ui/Button'
import Counter from '@/shared/ui/Counter'
import {
  MAX_CART_ITEM_QUANTITY,
  useCartStore,
} from '@/features/cart/cartStore'
import { IProduct } from '@/features/products/types'
interface Props {
  product: IProduct
}

export default function AddToCartButton({ product }: Readonly<Props>) {
  const add = useCartStore((state) => state.add)
  const remove = useCartStore((state) => state.remove)
  const removeFullProduct = useCartStore((state) => state.removeFullProduct)
  const items = useCartStore((state) => state.itemsIds)

  const productQuantity = items?.find(
    (item) => item.productId === product.id,
  )?.productQuantity

  const addProduct = useCallback(() => {
    add(product.id)
  }, [add, product.id])

  const removeProduct = useCallback(() => {
    if (productQuantity === 1) {
      removeFullProduct(product.id)
    } else {
      remove(product.id)
    }
  }, [productQuantity, removeFullProduct, remove, product.id])

  return (
    <>
      {!productQuantity && (
        <div data-testid="add-to-cart-btn">
          <Button
            id="add-btn"
            className="h-[42px] w-full px-4 font-semibold shadow-md hover:shadow-lg hover:brightness-110 md:h-[54px] md:w-[280px]"
            onClick={addProduct}
          >
            Add to cart
          </Button>
        </div>
      )}
      {productQuantity && (
        <Counter
          theme="dark"
          className="h-[42px] w-[110px] md:h-[48px] md:w-[120px]"
          count={productQuantity}
          maxCount={MAX_CART_ITEM_QUANTITY}
          addProduct={addProduct}
          removeProduct={removeProduct}
        />
      )}
    </>
  )
}
