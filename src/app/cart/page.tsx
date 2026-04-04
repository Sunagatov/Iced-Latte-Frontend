'use client'
import CartFull from '@/features/cart/components/CartFull/CartFull'
import CartEmpty from '@/features/cart/components/CartEmpty/CartEmpty'
import { useCartStore } from '@/features/cart/store'
import { useEffect, useState } from 'react'
import Loader from '@/shared/components/Loader/Loader'

export default function Cart() {
  const tempItems = useCartStore((state) => state.tempItems)
  const count = useCartStore((state) => state.count)
  const getCartItems = useCartStore((state) => state.getCartItems)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => { setHydrated(true) }, [])

  // While count says the cart is non-empty but tempItems hasn't hydrated yet
  // (e.g. guest added a brand-new product and getCartItems() is in-flight),
  // show a loader instead of an empty CartFull.
  const isHydrating = count > 0 && tempItems.length === 0

  useEffect(() => {
    if (hydrated && isHydrating) {
      getCartItems().catch(() => {})
    }
  }, [hydrated, isHydrating, getCartItems])

  if (!hydrated || isHydrating) return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader />
    </div>
  )

  return <>{tempItems.length > 0 ? <CartFull /> : <CartEmpty />}</>
}
