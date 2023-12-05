'use client'

import Image from 'next/image'
import circle_btn from '../../../public/circle_btn.png'

export default function CircleAddBtn({ onClick }: { onClick: () => void }) {
  return (
    <div onClick={onClick}>
      <Image src={circle_btn} alt="add to cart" className={'cursor-pointer'} />
    </div>
  )
}
