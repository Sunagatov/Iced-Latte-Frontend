import RegistrationForm from '@/components/Auth/Forms/RegistrationForm/RegistrationForm'
import Link from 'next/link'
import RestrictRoute from '@/Context/RestrictRoute'

export default function SignUpPage() {
  return (
    <RestrictRoute>
      <div className="flex min-h-[calc(100vh-7rem-7rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-4XL">Create your account</h2>
            <p className="mt-2 text-sm text-gray-600">
              Join us and start your coffee journey
            </p>
          </div>
          
          <div className="mt-8 space-y-6">
            <RegistrationForm />
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  href="/signin"
                  className="font-medium text-primary hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-gray-500">
                By registering for an account, you agree to our{' '}
                <a
                  className="text-xs font-medium underline"
                  href="/"
                >
                  Terms of Use.
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </RestrictRoute>
  )
}