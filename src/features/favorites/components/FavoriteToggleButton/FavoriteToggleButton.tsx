'use client'

import { RiHeartFill, RiHeartLine } from 'react-icons/ri'

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
  return (
    <button
      aria-busy={isPending}
      aria-label={isFavourited ? 'Remove from favourites' : 'Add to favourites'}
      aria-pressed={isFavourited}
      className={
        compact
          ? 'flex h-7 w-7 items-center justify-center rounded-full bg-white/80 shadow-sm backdrop-blur-sm disabled:opacity-50'
          : 'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition hover:bg-red-50 disabled:opacity-50'
      }
      disabled={isPending}
      onClick={onClick}
    >
      {isFavourited ? (
        <RiHeartFill className={compact ? 'text-negative h-4 w-4' : 'text-negative h-5 w-5'} />
      ) : (
        <RiHeartLine className={compact ? 'text-secondary h-4 w-4' : 'text-secondary h-5 w-5'} />
      )}
    </button>
  )
}
