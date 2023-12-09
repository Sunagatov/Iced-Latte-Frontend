'use client'
import Image from 'next/image'

type HeartProps = {
  active: boolean | undefined
  onClick: () => void
  className?: string
}

const HeartButton: React.FC<HeartProps> = ({ active, onClick, className }) => {
  const imageUrl = active ? '/heart_full.svg' : '/heart_empty.svg'

  return (
    <div className="duration-400 flex h-[54px] w-[54px] cursor-pointer items-center justify-center rounded-full bg-secondary transition ease-in-out hover:bg-[#D9D9D9]">
      <button className={className} onClick={onClick} type="button">
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

export default HeartButton
