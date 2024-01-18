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

  const productQuantity = items?.find((item) => item.productId === product.id)
    ?.productQuantity

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
          <Button className={'w-full md:w-[278px]'} onClick={addProduct}>
            Add to cart &#x2022; ${product.price}
          </Button>
        </div>
      )}
      {productQuantity && (
        <div className="flex items-center gap-2 sm:mx-auto md:mx-0">
          <Counter
            theme="dark"
            count={productQuantity}
            addProduct={addProduct}
            removeProduct={removeProduct}
          />
          <Button className={'w-[123px] cursor-default hover:bg-brand-solid'}>
            ${product.price}
          </Button>
        </div>
      )}
    </>
  )
}
