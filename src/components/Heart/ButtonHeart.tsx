import Image from 'next/image'
import heartFull from '../../../public/heart_full.svg'
import heartEmpty from '../../../public/heart_empty.svg'
import { twMerge } from 'tailwind-merge'

type ButtonHeartProps = {
  active: boolean
  onClick: () => void
  className?: string
}

const ButtonHeart = ({ active, onClick, className }: ButtonHeartProps) => {
  const imageUrl = active ? heartFull : heartEmpty

  return (
    <button
      onClick={onClick}
      className={twMerge(
        'duration-400 hover:bg-hover-heart flex h-[54px] w-[54px] cursor-pointer items-center justify-center rounded-full bg-secondary transition ease-in-out',
        className,
      )}
    >
      <Image src={imageUrl} alt={`heart ${active ? 'liked' : 'unliked'}`} />
    </button>
  )
}

export default ButtonHeart
