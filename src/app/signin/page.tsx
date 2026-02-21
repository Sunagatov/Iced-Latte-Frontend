import LoginForm from '@/components/Auth/Forms/LoginForm/LoginForm'
import SocialAuthButtons from '@/components/Auth/SocialAuthButtons'
import Link from 'next/link'
import RestrictRoute from '@/Context/RestrictRoute'

export default function SignInPage() {
  return (
    <RestrictRoute>
      <div className="flex min-h-[calc(100vh-112px)]">
        {/* Left decorative panel */}
        <div className="hidden lg:sticky lg:top-0 lg:flex lg:h-[calc(100vh-112px)] lg:w-[45%] flex-col justify-end gap-16 bg-[#0D0D0D] px-12 pb-12 pt-10 text-white">
          <div>
            <p className="text-4xl font-bold leading-tight">
              Your daily brew,<br />delivered with love.
            </p>
            <p className="mt-4 text-sm text-white/50">Specialty coffee, curated for you.</p>
          </div>
          <p className="text-xs text-white/30">© 2026 Iced Latte. Open-source community.</p>
        </div>

        {/* Right form panel */}
        <div className="flex flex-1 items-center justify-center overflow-y-auto px-6 py-12">
          <div className="w-full max-w-[400px]">
            <h1 className="text-[28px] font-bold text-[#0D0D0D]">Welcome back</h1>
            <p className="mt-1 text-sm text-[#64748B]">Sign in to your account</p>

            <div className="mt-8">
              <SocialAuthButtons mode="signin" />
            </div>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#E2E8F0]" />
              <span className="text-xs text-[#94A3B8]">or continue with email</span>
              <div className="h-px flex-1 bg-[#E2E8F0]" />
            </div>

            <LoginForm />

            <div className="mt-4 text-center">
              <Link href="/forgotpass" className="text-sm text-[#682EFF] hover:underline">
                Forgot password?
              </Link>
            </div>

            <p className="mt-6 text-center text-sm text-[#64748B]">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-semibold text-[#0D0D0D] hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </RestrictRoute>
  )
}
