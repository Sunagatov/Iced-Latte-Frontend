'use client'
import Image from 'next/image'
import { twMerge } from 'tailwind-merge'

interface ICircleAddBtnProps {
  onClick: () => void
  className?: string
  iconClassName?: string
}

const CircleAddBtn = ({
  onClick = () => {},
  className,
  iconClassName,
}: Readonly<ICircleAddBtnProps>) => {
  return (
    <button
      onClick={onClick}
      onKeyDown={onClick}
      className={twMerge(
        'flex h-12 w-12 transform cursor-pointer items-center justify-center rounded-full  bg-inverted transition-all duration-500 ease-in-out hover:scale-105 focus:bg-inverted active:bg-fullpage-tint',
        className,
      )}
    >
      <Image
        className={iconClassName}
        src="/plus.svg"
        width={16}
        height={16}
        alt="add to cart"
      />
    </button>
  )
}

export default CircleAddBtn
