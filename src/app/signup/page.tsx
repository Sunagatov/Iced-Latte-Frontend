import RegistrationForm from '@/features/auth/components/Forms/RegistrationForm/RegistrationForm'
import SocialAuthButtons from '@/features/auth/components/SocialAuthButtons'
import Link from 'next/link'
import RestrictRoute from '@/shared/providers/RestrictRoute'

export default function SignUpPage() {
  return (
    <RestrictRoute>
      <div className="flex min-h-[calc(100vh-112px)]">
        {/* Left decorative panel */}
        <div className="hidden lg:sticky lg:top-0 lg:flex lg:h-[calc(100vh-112px)] lg:w-[45%] flex-col justify-end gap-10 bg-[#682EFF] px-12 pb-12 pt-10 text-white">
          <div>
            <p className="text-4xl font-bold leading-tight">
              Join thousands of<br />coffee lovers.
            </p>
            <p className="mt-4 text-sm text-white/60">
              Discover, order, and enjoy specialty coffee — curated by the community.
            </p>
            <div className="mt-8 flex flex-col gap-2">
              {['Free shipping on first order', 'Exclusive member deals', 'Community reviews'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-white/80">
                  <span>✓</span> {item}
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-white/30">© 2026 Iced Latte. Open-source community.</p>
        </div>

        {/* Right form panel */}
        <div className="flex flex-1 items-start justify-center overflow-y-auto px-6 py-12">
          <div className="w-full max-w-[400px]">
            <h1 className="text-[28px] font-bold text-[#0D0D0D]">Create your account</h1>
            <p className="mt-1 text-sm text-[#64748B]">Join us and start your coffee journey</p>

            <div className="mt-8">
              <SocialAuthButtons mode="signup" />
            </div>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#E2E8F0]" />
              <span className="text-xs text-[#94A3B8]">or sign up with email</span>
              <div className="h-px flex-1 bg-[#E2E8F0]" />
            </div>

            <RegistrationForm />

            <p className="mt-6 text-center text-sm text-[#64748B]">
              Already have an account?{' '}
              <Link href="/signin" className="font-semibold text-[#0D0D0D] hover:underline">
                Sign in
              </Link>
            </p>

            <p className="mt-3 text-center text-xs text-[#94A3B8]">
              By registering you agree to our{' '}
              <a href="/" className="underline hover:text-[#64748B]">Terms of Use</a>
            </p>
          </div>
        </div>
      </div>
    </RestrictRoute>
  )
}
