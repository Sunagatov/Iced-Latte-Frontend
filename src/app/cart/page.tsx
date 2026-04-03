'use client'
import CartFull from '@/features/cart/components/CartFull/CartFull'
import CartEmpty from '@/features/cart/components/CartEmpty/CartEmpty'
import { useCartStore, CartSliceStore } from '@/features/cart/store'
import { useEffect, useState } from 'react'
import Loader from '@/shared/components/Loader/Loader'

export default function Cart() {
  const tempItems = useCartStore((state: CartSliceStore) => state.tempItems)
  const count = useCartStore((state: CartSliceStore) => state.count)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => { setHydrated(true) }, [])

  if (!hydrated) return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader />
    </div>
  )

  return <>{(tempItems.length > 0 || count > 0) ? <CartFull /> : <CartEmpty />}</>
}
