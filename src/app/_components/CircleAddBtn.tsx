'use client'

import Image from 'next/image'
import circle_btn from '../../../public/circle_btn.png'

export default function CircleAddBtn() {
  return (
    <div>
      <Image src={circle_btn} alt="add to cart" className={'cursor-pointer'} />
    </div>
  )
}
