'use client'
import Image from 'next/image'
import CloseIcon from '@/../public/close.svg'

interface ICircleCloseBtn {
  onClick: () => void;
  id: string
}

export default function CircleCloseBtn( props : Readonly<ICircleCloseBtn>) {
  return (
    <button
      className={
        'flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-secondary focus:bg-inverted active:bg-fullpage-tint transition-all duration-500 ease-in-out transform hover:scale-105'
      }
      {...props}
    >
      <Image src={CloseIcon} alt="add to cart" />
    </button>
  )
}