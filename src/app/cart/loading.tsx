import Loader from '@/components/UI/Loader/Loader'

const CartLoading = () => {
  return (
    <div className="flex min-h-[100vh] w-full items-center justify-center">
      <Loader />
    </div>
  )
}

export default CartLoading