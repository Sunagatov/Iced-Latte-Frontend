import { useCombinedStore } from '@/store/store'
import CartEmpty from './_components/CartEmpty'
import { useStoreData } from '@/hooks/useStoreData'
// import CartFull from './_components/CartFull'

export default function Cart() {
  return (
    <>
      <CartEmpty />
      {/* <CartFull /> */}
    </>
  )
}
