'use client'
import CartFull from '../../components/Cart/CartFull/CartFull'
import CartEmpty from '../../components/Cart/CartEmpty/CartEmpty'
import { useCombinedStore } from '@/store/store'
import { useStoreData } from '@/hooks/useStoreData'

export default function Cart() {
  const count = useStoreData(useCombinedStore, (state) => state.count)

  return <>{count ? <CartFull /> : <CartEmpty />}</>
}
