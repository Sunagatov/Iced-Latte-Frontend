'use client'

import { useCombinedStore } from '@/store/store'
import CartEmpty from './_components/CartEmpty'
import { useStoreData } from '@/hooks/useStoreData'
import CartFull from './_components/CartFull'

export default function Cart() {
  const count = useStoreData(useCombinedStore, (state) => state.count)

  return <>{count ? <CartFull /> : <CartEmpty />}</>
}
