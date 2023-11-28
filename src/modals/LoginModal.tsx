import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

type LoginModalProps = {
  onCloseModal?: () => void
}

export default function LoginModal({onCloseModal}:LoginModalProps) {
  return (
    <div className="relative z-10" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="pointer-events-auto relative w-screen max-w-md">
              <div className="absolute left-0 top-0 -ml-8 flex pr-2 pt-4 sm:-ml-10 sm:pr-4">
                <button onClick={onCloseModal} type="button" className="relative rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white">
                  <span className="absolute -inset-2.5"></span>
                  <span className="sr-only">Close panel</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                <div className="px-4 sm:px-6">
                  <h2 className="text-4XL">Welcome back</h2>
                </div>
                <div className="relative mt-6 flex-1 px-4 sm:px-6">
                  <Input
                    name="email"
                    label='Enter your email address'
                    placeholder='Enter your email address'
                  />
                  <Input
                    name='password'
                    label='Password'
                    placeholder='Password'
                  />
                  <Button className='w-full mt-6'>
                    Login
                  </Button>
                  <Button className='w-full mt-6'>
                    Forgotten your password?
                  </Button>
                  <div className='h-[1px] w-full mb-8 bg-brand-second' />
                  <h2 className='text-4XL'>
                    I’m new here
                  </h2>
                  <Button className='w-full mt-6'>
                    Register
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>

  )
}