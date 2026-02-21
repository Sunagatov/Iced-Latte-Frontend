'use client'
import CartFull from '../../components/Cart/CartFull/CartFull'
import CartEmpty from '../../components/Cart/CartEmpty/CartEmpty'
import { useCombinedStore } from '@/store/store'

export default function Cart() {
  const count = useCombinedStore((state) => state.count)

  return <>{count ? <CartFull /> : <CartEmpty />}</>
}
