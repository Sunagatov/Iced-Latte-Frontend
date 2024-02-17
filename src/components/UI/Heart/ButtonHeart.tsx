import Image from 'next/image'
import active_heart from '../../../../public/active_heart.svg'
import not_active_heart from '../../../../public/not_active_heart.svg'
import { twMerge } from 'tailwind-merge'
import { ButtonHeartProps } from '@/types/ButtonHeart'

export default function ButtonHeart({
  active,
  onClick,
  className,
}: Readonly<ButtonHeartProps>) {
  const imageUrl = active ? active_heart : not_active_heart

  return (
    <button
      onClick={onClick}
      className={twMerge(
        'flex h-[54px] w-[54px] cursor-pointer items-center justify-center rounded-full bg-secondary transition-all duration-500 ease-in-out transform hover:scale-105 ',
        className,
      )}
    >
      <Image src={imageUrl} alt={`heart ${active ? 'liked' : 'unliked'}`} />
    </button>
  )
}
