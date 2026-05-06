import Link from 'next/link'
import { ROUTES } from '@/shared/config/routes'
import RegistrationForm from '@/features/auth/components/RegistrationForm'
import SocialAuthButtons from '@/features/auth/components/SocialAuthButtons'
import RestrictRoute from '@/features/auth/RestrictRoute'

export default function SignUpPage() {
  return (
    <RestrictRoute>
      <div className="flex min-h-[calc(100vh-112px)]">
        <div className="hidden flex-col justify-end gap-10 bg-brand-solid px-12 pt-10 pb-12 text-white lg:sticky lg:top-0 lg:flex lg:h-[calc(100vh-112px)] lg:w-[45%]">
          <div>
            <p className="text-4xl leading-tight font-bold">
              Join thousands of
              <br />
              coffee lovers.
            </p>
            <p className="mt-4 text-sm text-white/60">
              Discover, order, and enjoy specialty coffee — curated by the
              community.
            </p>
            <div className="mt-8 flex flex-col gap-2">
              {[
                'Free shipping on first order',
                'Exclusive member deals',
                'Community reviews',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-sm text-white/80"
                >
                  <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg> {item}
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-white/30">
            © 2026 Iced Latte. Open-source community.
          </p>
        </div>

        <div className="flex flex-1 items-start justify-center overflow-y-auto px-6 py-12">
          <div className="w-full max-w-[400px]">
            <h1 className="text-[28px] font-bold text-[#0D0D0D]">
              Create your account
            </h1>
            <p className="mt-1 text-sm text-[#64748B]">
              Join us and start your coffee journey
            </p>

            <div className="mt-8">
              <SocialAuthButtons mode="signup" />
            </div>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#E2E8F0]" />
              <span className="text-xs text-[#94A3B8]">
                or sign up with email
              </span>
              <div className="h-px flex-1 bg-[#E2E8F0]" />
            </div>

            <RegistrationForm />

            <p className="mt-6 text-center text-sm text-[#64748B]">
              Already have an account?{' '}
              <Link
                href={ROUTES.signin}
                className="font-semibold text-[#0D0D0D] hover:underline"
              >
                Sign in
              </Link>
            </p>

            <p className="mt-3 text-center text-xs text-[#94A3B8]">
              By registering you agree to our{' '}
              <Link href={ROUTES.home} className="underline hover:text-[#64748B]">
                Terms of Use
              </Link>
            </p>
          </div>
        </div>
      </div>
    </RestrictRoute>
  )
}
