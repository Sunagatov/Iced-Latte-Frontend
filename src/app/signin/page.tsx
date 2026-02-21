import LoginForm from '@/components/Auth/Forms/LoginForm/LoginForm'
import Link from 'next/link'
import RestrictRoute from '@/Context/RestrictRoute'

export default function SignInPage() {
  return (
    <RestrictRoute>
      <div className="flex min-h-[calc(100vh-7rem-7rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-4XL">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to your account
            </p>
          </div>
          
          <div className="mt-8 space-y-6">
            <LoginForm />
            
            <div className="text-center">
              <Link
                href="/forgotpass"
                className="text-sm text-focus hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Or</span>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  href="/signup"
                  className="font-medium text-primary hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </RestrictRoute>
  )
}