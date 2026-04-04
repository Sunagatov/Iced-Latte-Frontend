import Image from 'next/image'
import active_heart from '@/../public/active_heart.svg'
import not_active_heart from '@/../public/not_active_heart.svg'
import { twMerge } from 'tailwind-merge'
interface ButtonHeartProps { active: boolean; onClick: () => void; className?: string; label?: string; disabled?: boolean }

export default function ButtonHeart({
  active,
  onClick,
  className,
  label,
  disabled,
}: Readonly<ButtonHeartProps>) {
  const imageUrl = active ? active_heart : not_active_heart

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label ?? (active ? 'Remove from favourites' : 'Add to favourites')}
      aria-pressed={active}
      aria-busy={disabled}
      className={twMerge(
        'flex h-[54px] w-[54px] cursor-pointer items-center justify-center rounded-full bg-secondary transition-all duration-200 hover:bg-hover-heart hover:scale-110 active:scale-90 outline-none focus-visible:ring-2 focus-visible:ring-brand-solid focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100',
        className,
      )}
    >
      <Image src={imageUrl} alt={`heart ${active ? 'liked' : 'unliked'}`} />
    </button>
  )
}
