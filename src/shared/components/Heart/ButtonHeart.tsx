import Image, { type StaticImageData } from 'next/image'
import { twMerge } from 'tailwind-merge'
import active_heart from '@/../public/active_heart.svg'
import not_active_heart from '@/../public/not_active_heart.svg'

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
  const imageUrl: StaticImageData = active
    ? (active_heart as unknown as StaticImageData)
    : (not_active_heart as unknown as StaticImageData)

  return (
    <button
      type="button"
      aria-busy={disabled}
      aria-label={
        label ?? (active ? 'Remove from favourites' : 'Add to favourites')
      }
      aria-pressed={active}
      className={twMerge(
        'flex h-[54px] w-[54px] cursor-pointer items-center justify-center rounded-full bg-secondary transition-all duration-200 outline-none hover:scale-110 hover:bg-hover-heart active:scale-90 focus-visible:ring-2 focus-visible:ring-brand-solid focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:scale-100',
        className,
      )}
      disabled={disabled}
      onClick={onClick}
    >
      <Image src={imageUrl} alt={`heart ${active ? 'liked' : 'unliked'}`} />
    </button>
  )
}