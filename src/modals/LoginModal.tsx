import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function LoginModal() {
  return (
    <div className="relative z-10" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="pointer-events-auto relative w-screen">
              <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                <div className="px-4 sm:px-6">
                  <h2 className="text-4XL">Welcome back</h2>
                </div>
                <div className="relative mt-6 flex-1 px-4 sm:px-6">
                  <Input
                    label='Enter your email address'
                    placeholder='Enter your email address'
                  />
                  <Input
                    label='Password'
                    placeholder='Password'
                  />
                  <Button className='w-full mt-[24px]'>
                    Login
                  </Button>
                  <Button className='w-full mt-[24px]'>
                    Forgotten your password?
                  </Button>
                  <div className='h-[1px] w-full my-[32px] bg-brand-second' />
                  <h2 className='text-4XL'>
                    I’m new here
                  </h2>
                  <Button className='w-full mt-[24px]'>
                    Register
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  )
}