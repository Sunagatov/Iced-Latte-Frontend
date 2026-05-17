'use client'
import Image from 'next/image'
import { twMerge } from 'tailwind-merge'

interface ICircleAddBtnProps {
  onClick: () => void
  className?: string
  iconClassName?: string
  disabled?: boolean
}

const CircleAddBtn = ({
  onClick = () => {},
  className,
  iconClassName,
  disabled = false,
}: Readonly<ICircleAddBtnProps>) => {
  return (
    <button
      className={twMerge(
        'bg-inverted focus:bg-inverted active:bg-fullpage-tint flex h-12 w-12 transform cursor-pointer items-center justify-center rounded-full transition-all duration-500 ease-in-out hover:scale-105',
        className,
      )}
      data-testid="add-to-cart-circle-btn"
      disabled={disabled}
      onClick={onClick}
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
