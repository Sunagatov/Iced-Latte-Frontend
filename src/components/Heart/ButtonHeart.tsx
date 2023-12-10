import Image from 'next/image'
import { ButtonHeartProps } from './index'

const ButtonHeart: React.FC<ButtonHeartProps> = ({
  active,
  onClick,
  className,
}) => {
  const imageUrl = active ? '/heart_full.svg' : '/heart_empty.svg'

  return (
    <div
      className={`duration-400 flex h-[54px] w-[54px] cursor-pointer items-center justify-center rounded-full bg-secondary transition ease-in-out hover:bg-[#D9D9D9] ${className}`}
    >
      <button onClick={onClick} type="button">
        <Image
          src={imageUrl}
          alt={`heart ${active ? 'full' : 'empty'}`}
          width={27}
          height={27}
        />
      </button>
    </div>
  )
}

export default ButtonHeart
