'use client'
import Image from 'next/image'
import circle_btn from '../../../../../public/plus.svg'

export default function CircleAddBtn({ onClick }: { onClick: () => void }) {
  return (
    <div onClick={onClick} onKeyDown={onClick}>
      <button
        className={
          'flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-inverted hover:bg-fullpage-tint focus:bg-inverted active:bg-fullpage-tint'
        }
      >
        <Image src={circle_btn} alt="add to cart" />
      </button>
    </div>
  )
}
