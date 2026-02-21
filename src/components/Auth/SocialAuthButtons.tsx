'use client'

function SocialButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-[#E2E8F0] bg-white text-sm font-medium text-[#1A202C] transition hover:bg-[#F7F8FA] active:scale-[0.98]"
    >
      {icon}
      {label}
    </button>
  )
}

const GoogleIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
  </svg>
)

const AppleIcon = (
  <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
    <path d="M13.173 9.558c-.02-2.117 1.73-3.14 1.81-3.19-.988-1.443-2.523-1.64-3.065-1.66-1.305-.133-2.558.775-3.22.775-.662 0-1.682-.757-2.768-.736-1.42.021-2.737.832-3.467 2.107-1.484 2.572-.38 6.37 1.063 8.453.706 1.02 1.543 2.163 2.641 2.122 1.063-.042 1.463-.682 2.748-.682 1.285 0 1.643.682 2.768.66 1.143-.02 1.863-1.04 2.562-2.063.81-1.18 1.143-2.327 1.163-2.387-.025-.01-2.23-.855-2.255-3.399Z" fill="#000"/>
    <path d="M11.07 3.18C11.64 2.49 12.03 1.54 11.92.57c-.83.043-1.84.556-2.43 1.23-.534.6-.998 1.57-.873 2.49.924.07 1.87-.47 2.453-1.11Z" fill="#000"/>
  </svg>
)

const FacebookIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M18 9a9 9 0 1 0-10.406 8.89v-6.288H5.31V9h2.284V7.017c0-2.255 1.343-3.502 3.4-3.502.985 0 2.015.176 2.015.176v2.215h-1.135c-1.118 0-1.467.694-1.467 1.406V9h2.496l-.399 2.602H10.41v6.288A9.003 9.003 0 0 0 18 9Z" fill="#1877F2"/>
  </svg>
)

export default function SocialAuthButtons({ mode }: { mode: 'signin' | 'signup' }) {
  const googleLabel = mode === 'signin' ? 'Continue with Google' : 'Sign up with Google'
  return (
    <div className="flex flex-col gap-3">
      <SocialButton label={googleLabel} icon={GoogleIcon} />
      <div className="flex gap-3">
        <SocialButton label="Apple" icon={AppleIcon} />
        <SocialButton label="Facebook" icon={FacebookIcon} />
      </div>
    </div>
  )
}
