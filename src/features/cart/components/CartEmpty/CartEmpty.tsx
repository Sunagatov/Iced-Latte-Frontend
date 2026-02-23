import Link from 'next/link'

export default function CartEmpty() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-[520px] flex-col items-center justify-center px-6 py-16 text-center">

      {/* Illustration */}
      <svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-8">
        {/* Background circle */}
        <circle cx="80" cy="80" r="80" fill="#F0EAFF"/>
        {/* Cart body */}
        <rect x="48" y="72" width="64" height="44" rx="8" fill="#682EFF" fillOpacity="0.12"/>
        <rect x="48" y="72" width="64" height="44" rx="8" stroke="#682EFF" strokeWidth="3"/>
        {/* Cart wheels */}
        <circle cx="64" cy="122" r="6" fill="#682EFF"/>
        <circle cx="96" cy="122" r="6" fill="#682EFF"/>
        {/* Cart handle */}
        <path d="M36 56h12l8 16h48l8-16h12" stroke="#682EFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Plus sign inside cart */}
        <line x1="80" y1="84" x2="80" y2="104" stroke="#682EFF" strokeWidth="3" strokeLinecap="round"/>
        <line x1="70" y1="94" x2="90" y2="94" stroke="#682EFF" strokeWidth="3" strokeLinecap="round"/>
      </svg>

      <h1 className="mb-3 text-3xl font-bold text-primary">Your cart is empty</h1>
      <p className="mb-2 text-base text-secondary">
        Looks like you haven't added anything yet.
      </p>
      <p className="mb-10 text-base text-secondary">
        Explore our coffee selection and find your next favourite brew.
      </p>

      <Link
        href="/"
        className="rounded-[48px] bg-brand-solid px-10 py-4 text-base font-semibold text-inverted transition-colors hover:bg-brand-solid-hover active:scale-95"
      >
        Browse Coffee
      </Link>

      <Link
        href="/favourites"
        className="mt-4 text-sm font-medium text-brand underline-offset-2 hover:underline"
      >
        View your favourites →
      </Link>
    </div>
  )
}
