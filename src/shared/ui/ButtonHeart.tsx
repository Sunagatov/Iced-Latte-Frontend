import { twMerge } from 'tailwind-merge'

interface ButtonHeartProps {
  active: boolean
  onClick: () => void
  className?: string
  label?: string
  disabled?: boolean
}

export default function ButtonHeart({
  active,
  onClick,
  className,
  label,
  disabled,
}: Readonly<ButtonHeartProps>) {
  return (
    <button
      type="button"
      aria-busy={disabled}
      aria-label={
        label ?? (active ? 'Remove from favourites' : 'Add to favourites')
      }
      aria-pressed={active}
      className={twMerge(
        'focus-visible:ring-brand-solid flex h-[54px] w-[54px] cursor-pointer items-center justify-center rounded-full transition-all duration-200 outline-none hover:scale-110 focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-90 disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-50',
        active ? 'bg-brand-solid text-white' : 'bg-black/[0.04] text-black/40 hover:text-brand',
        className,
      )}
      disabled={disabled}
      onClick={onClick}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  )
}
