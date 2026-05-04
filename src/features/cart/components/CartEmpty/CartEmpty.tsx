import Link from 'next/link'

export default function CartEmpty() {
  return (
    <div
      data-testid="cart-empty"
      className="mx-auto flex min-h-[70vh] max-w-[520px] flex-col items-center justify-center px-6 py-16 text-center"
    >
      {/* Illustration */}
      <svg
        width="160"
        height="160"
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mb-8"
      >
        {/* Background circle */}
        <circle cx="80" cy="80" r="80" fill="#F0F7F4" />
        {/* Cart body */}
        <rect
          x="48"
          y="72"
          width="64"
          height="44"
          rx="8"
          fill="#1B4332"
          fillOpacity="0.12"
        />
        <rect
          x="48"
          y="72"
          width="64"
          height="44"
          rx="8"
          stroke="#1B4332"
          strokeWidth="3"
        />
        {/* Cart wheels */}
        <circle cx="64" cy="122" r="6" fill="#1B4332" />
        <circle cx="96" cy="122" r="6" fill="#1B4332" />
        {/* Cart handle */}
        <path
          d="M36 56h12l8 16h48l8-16h12"
          stroke="#1B4332"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Plus sign inside cart */}
        <line
          x1="80"
          y1="84"
          x2="80"
          y2="104"
          stroke="#1B4332"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="70"
          y1="94"
          x2="90"
          y2="94"
          stroke="#1B4332"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>

      <h1 className="text-primary mb-3 text-3xl font-bold">
        Your cart is empty
      </h1>
      <p className="text-secondary mb-2 text-base">
        Looks like you haven&apos;t added anything yet.
      </p>
      <p className="text-secondary mb-10 text-base">
        Explore our selection and find something you&apos;ll love.
      </p>

      <Link
        href="/"
        className="bg-brand-solid text-inverted hover:bg-brand-solid-hover rounded-[48px] px-10 py-4 text-base font-semibold transition-colors active:scale-95"
      >
        Start shopping
      </Link>

      <Link
        href="/favourites"
        className="text-brand mt-4 text-sm font-medium underline-offset-2 hover:underline"
      >
        View your favourites →
      </Link>
    </div>
  )
}
