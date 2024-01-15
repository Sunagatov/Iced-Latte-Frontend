'use client'

import CartFull from './_components/CartFull'
import CartEmpty from './_components/CartEmpty'
import { useCombinedStore } from '@/store/store'
import { useStoreData } from '@/hooks/useStoreData'

export default function Cart() {
  const count = useStoreData(useCombinedStore, (state) => state.count)

  return <>{count ? <CartFull /> : <CartEmpty />}</>
}
