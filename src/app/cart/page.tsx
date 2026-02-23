'use client'
import CartFull from '../../components/Cart/CartFull/CartFull'
import CartEmpty from '../../components/Cart/CartEmpty/CartEmpty'
import { useCombinedStore } from '@/store/store'
import { useEffect, useState } from 'react'
import Loader from '@/components/UI/Loader/Loader'

export default function Cart() {
  const count = useCombinedStore((state) => state.count)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => setHydrated(true), [])

  if (!hydrated) return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader />
    </div>
  )

  return <>{count ? <CartFull /> : <CartEmpty />}</>
}
