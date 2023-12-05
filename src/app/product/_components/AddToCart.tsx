'use client'

import Button from '@/components/ui/Button'
import { IProduct } from '@/models/Products'
import Counter from '../../../components/ui/Counter'
import { useCombinedStore } from '@/store/store'
import { useStoreData } from '@/hooks/useStoreData'

type Props = {
  product: IProduct
}

export default function AddToCartButton({ product }: Props) {
  const [add, remove] = useCombinedStore((state) => [state.add, state.remove])
  const items = useStoreData(useCombinedStore, (state) => state.items)
  const { name, price, description, active, quantity } = product

  const productQuantity = items?.find((item) => item.id === product.id)
    ?.quantity

  const addProduct = () => {
    add({
      id: product.id,
      info: {
        name,
        price,
        description,
        active,
        quantity,
      },
      quantity: 1,
    })
  }

  const removeProduct = () => {
    remove(product.id)
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
            removeProduct={() => removeProduct()}
          />
          <Button className={'w-[123px] cursor-default hover:bg-brand-solid'}>
            ${product.price}
          </Button>
        </div>
      )}
    </>
  )
}
