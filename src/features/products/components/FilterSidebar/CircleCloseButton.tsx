'use client'

import Image from 'next/image'
import CloseIcon from '@/../public/close.svg'

interface CircleCloseButtonProps {
  onClick: () => void
  id: string
}

export default function CircleCloseButton({
  onClick,
  id,
}: Readonly<CircleCloseButtonProps>) {
  return (
    <button
      id={id}
      type="button"
      aria-label="Close filters"
      className="bg-secondary focus:bg-inverted active:bg-fullpage-tint flex h-14 w-14 transform cursor-pointer items-center justify-center rounded-full transition-all duration-500 ease-in-out hover:scale-105"
      onClick={onClick}
    >
      <Image src={CloseIcon} alt="" aria-hidden="true" />
    </button>
  )
}
