import Image from 'next/image'
import active_heart from '../../../../public/active_heart.svg'
import not_active_heart from '../../../../public/not_active_heart.svg'
import { twMerge } from 'tailwind-merge'
import { ButtonHeartProps } from '@/types/ButtonHeart'

export default function ButtonHeart({ active, onClick, className }: Readonly<ButtonHeartProps>) {
  const imageUrl = active ? active_heart : not_active_heart

  return (
    <button
      onClick={onClick}
      className={twMerge(
        'duration-400 flex h-[54px] w-[54px] cursor-pointer items-center justify-center rounded-full bg-secondary transition ease-in-out hover:bg-hover-heart',
        className,
      )}
    >
      <Image src={imageUrl} alt={`heart ${active ? 'liked' : 'unliked'}`} />
    </button>
  )
}


