import Button from '@/components/ui/Button'
import Image from 'next/image'
import search from '../../../../public/search_cart.png'

// interface CartEmptyProps {
//   onClose: () => void
//   isLoggedIn: boolean
// }

export default function CartEmpty() {
  return (
    <div className="w-{800px} 1px h-{513px} mx-auto outline sm:w-[500px]">
      <h2 className="mx-4 my-6 text-4xl">Shopping cart</h2>
      <div className="mt-12 flex flex-col items-center ">
        <Image
          src={search}
          width={240}
          height={205}
          alt="search icon"
          priority
        />
        <div className=" mt-12  flex flex-col items-center gap-6 py-4">
          <p>Your card is empty</p>
          <Button className="h-14 w-[211px] text-lg font-medium">
            Continue Shopping
          </Button>
          {/* {!isLoggedIn && (
              <Button className="h-14 w-[211px] text-lg font-medium">
                Login
              </Button>
            )} */}
        </div>
      </div>
    </div>
  )
}
