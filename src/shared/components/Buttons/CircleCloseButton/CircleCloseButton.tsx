'use client'
import Image from 'next/image'
import CloseIcon from '@/../public/close.svg'

interface ICircleCloseBtn {
  onClick: () => void
  id: string
}

export default function CircleCloseBtn(props: Readonly<ICircleCloseBtn>) {
  return (
    <button
      className={
        'bg-secondary focus:bg-inverted active:bg-fullpage-tint flex h-14 w-14 transform cursor-pointer items-center justify-center rounded-full transition-all duration-500 ease-in-out hover:scale-105'
      }
      {...props}
    >
      <Image src={CloseIcon} alt="add to cart" />
    </button>
  )
}
