'use client'

interface FavoriteToggleButtonProps {
  compact?: boolean
  isFavourited: boolean
  isPending: boolean
  onClick: React.MouseEventHandler<HTMLButtonElement>
}

export default function FavoriteToggleButton({
  compact = false,
  isFavourited,
  isPending,
  onClick,
}: Readonly<FavoriteToggleButtonProps>) {
  const size = compact ? 'h-7 w-7' : 'h-8 w-8'
  const iconSize = compact ? 'h-4 w-4' : 'h-5 w-5'

  return (
    <button
      aria-busy={isPending}
      aria-label={isFavourited ? 'Remove from favourites' : 'Add to favourites'}
      aria-pressed={isFavourited}
      className={`flex ${size} shrink-0 items-center justify-center rounded-full transition disabled:opacity-50 ${
        isFavourited
          ? 'bg-brand-solid text-white'
          : 'bg-black/[0.04] text-black/40 hover:text-brand'
      }`}
      disabled={isPending}
      onClick={onClick}
    >
      <svg
        className={iconSize}
        viewBox="0 0 24 24"
        fill={isFavourited ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  )
}
