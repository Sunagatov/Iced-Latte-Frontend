'use client'
import { useCallback } from 'react'
import Button from '@/components/UI/Buttons/Button/Button'
import Counter from '../../UI/Counter/Counter'
import { useCombinedStore } from '@/store/store'
import { useAuthStore } from '@/store/authStore'
import { Props } from '@/types/AddToCard'

export default function AddToCartButton({ product }: Readonly<Props>) {
  const add = useCombinedStore((state) => state.add)
  const remove = useCombinedStore((state) => state.remove)
  const removeFullProduct = useCombinedStore((state) => state.removeFullProduct)
  const token = useAuthStore((state) => state.token)
  const items = useCombinedStore((state) => state.itemsIds)

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
        <div className="flex items-center gap-2">
          <Counter
            theme="dark"
            count={productQuantity}
            addProduct={addProduct}
            removeProduct={removeProduct}
          />
          <div className="flex h-[42px] min-w-0 flex-1 cursor-default items-center justify-center rounded-[48px] bg-brand-solid font-semibold text-inverted shadow-md md:h-[54px] md:w-[110px] md:flex-none">
            ${product.price}
          </div>
        </div>
      )}
    </>
  )
}
