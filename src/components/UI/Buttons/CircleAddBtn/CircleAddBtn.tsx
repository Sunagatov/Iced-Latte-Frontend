'use client'
import Image from 'next/image'
import circle_btn from '../../../../../public/plus.svg'

const CircleAddBtn = ({ onClick }: { onClick: () => void }) => {
  return (
    <div onClick={onClick} onKeyDown={onClick}>
      <button
        className={
          'flex h-12 w-12 transform cursor-pointer items-center justify-center rounded-full  bg-inverted transition-all duration-500 ease-in-out hover:scale-105 focus:bg-inverted active:bg-fullpage-tint'
        }
      >
        <Image src={circle_btn} alt="add to cart" />
      </button>
    </div>
  )
}

export default CircleAddBtn
