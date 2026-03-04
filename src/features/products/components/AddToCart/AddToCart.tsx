'use client'
import { useCallback } from 'react'
import Button from '@/shared/components/Buttons/Button/Button'
import Counter from '@/shared/components/Counter/Counter'
import { useCartStore } from '@/features/cart/store'
import { IProduct } from '@/features/products/types'
interface Props { product: IProduct }

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
            className="h-[42px] w-full px-4 font-semibold shadow-md hover:brightness-110 hover:shadow-lg md:h-[54px] md:w-[280px]"
            onClick={addProduct}
          >
            Add to cart · ${product.price}
          </Button>
        </div>
      )}
      {productQuantity && (
        <div className="flex items-center gap-3">
          <Counter
            theme="dark"
            className="h-[42px] w-[110px] md:h-[48px] md:w-[120px]"
            count={productQuantity}
            addProduct={addProduct}
            removeProduct={removeProduct}
          />
          <div className="flex h-[42px] w-auto min-w-[72px] cursor-default items-center justify-center rounded-[48px] bg-brand-solid px-4 font-semibold text-inverted shadow-md md:h-[54px] md:min-w-[110px]">
            ${product.price}
          </div>
        </div>
      )}
    </>
  )
}
