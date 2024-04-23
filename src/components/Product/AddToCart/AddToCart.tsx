'use client'
import Button from '@/components/UI/Buttons/Button/Button'
import Counter from '../../UI/Counter/Counter'
import { useCombinedStore } from '@/store/store'
import { useStoreData } from '@/hooks/useStoreData'
import { useAuthStore } from '@/store/authStore'
import { Props } from '@/types/AddToCard'

export default function AddToCartButton({ product }: Readonly<Props>) {
  const [add, remove, removeFullProduct] = useCombinedStore((state) => [
    state.add,
    state.remove,
    state.removeFullProduct,
  ])
  const token = useAuthStore((state) => state.token)
  const items = useStoreData(useCombinedStore, (state) => state.itemsIds)

  const productQuantity = items?.find(
    (item) => item.productId === product.id,
  )?.productQuantity

  const addProduct = () => {
    add(product.id, token)
  }

  const removeProduct = () => {
    if (productQuantity === 1) {
      removeFullProduct(product.id, token)
    } else {
      remove(product.id, token)
    }
  }

  return (
    <>
      {!productQuantity && (
        <div>
          <Button
            id="add-btn"
            className="w-full md:w-[278px] "
            onClick={addProduct}
          >
            Add to cart &#x2022; ${product.price}
          </Button>
        </div>
      )}
      {productQuantity && (
        <div className="flex cursor-pointer items-center gap-2 md:mx-0">
          <Counter
            theme="dark"
            count={productQuantity}
            addProduct={addProduct}
            removeProduct={removeProduct}
          />
          <div className="flex h-[54px] w-[123px] cursor-default items-center justify-center rounded-[48px] bg-brand-solid px-[16px] text-L text-inverted">
            <span className="pointer-events-none ">${product.price}</span>
          </div>
        </div>
      )}
    </>
  )
}
