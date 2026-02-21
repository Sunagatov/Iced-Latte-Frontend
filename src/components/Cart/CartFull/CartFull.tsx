import Button from '@/components/UI/Buttons/Button/Button'
import CartElement from '../CartElement/CartElement'
import { useCombinedStore } from '@/store/store'
import { ICartItem } from '@/types/Cart'
import { useAuthStore } from '@/store/authStore'
import { UserData } from '@/types/services/UserServices'
import Link from 'next/link'

const hasValidAddress = (userData: UserData | null): boolean => {
  return Boolean(
    userData?.address?.line &&
    userData?.address?.city &&
    userData?.address?.country
  )
}

const getCheckoutState = (token: string | null, userData: UserData | null) => {
  if (!token) return { disabled: true, message: null }
  if (!hasValidAddress(userData)) return { disabled: true, message: 'Specify address in account' }
  return { disabled: false, message: null }
}

export default function CartFull() {
  const { tempItems, totalPrice, removeFullProduct, remove, add } =
    useCombinedStore()
  const { token, userData } = useAuthStore()
  const checkoutState = getCheckoutState(token, userData)

  return (
    <div className="h-{513px} mx-auto flex min-w-[328px] flex-col px-4 md:max-w-[800px]">
      <h2 className="mx-4 my-6 text-left text-4xl">Shopping cart</h2>
      <div>
        {tempItems.map((item: ICartItem) => (
          <CartElement
            key={item.id}
            product={item}
            remove={() => remove(item.productInfo.id)}
            removeAll={() => removeFullProduct(item.productInfo.id)}
            add={() => add(item.productInfo.id)}
          />
        ))}
      </div>

      <div className="mt-4 flex justify-between font-semibold ">
        <p>Subtotal:</p>
        <p>${totalPrice.toFixed(2)}</p>
      </div>
      {checkoutState.message && (
        <div>
          <p className="text-red-500">{checkoutState.message}</p>
        </div>
      )}
      <div className="flex justify-center">
        <Button
          id="go-checkout-btn"
          className="my-6 h-14 w-full text-lg font-medium sm:w-[211px]"
          disabled={checkoutState.disabled}
        >
          {checkoutState.disabled ? (
            'Go to checkout'
          ) : (
            <Link href={'/checkout'}>{'Go to checkout'}</Link>
          )}
        </Button>
      </div>
    </div>
  )
}
