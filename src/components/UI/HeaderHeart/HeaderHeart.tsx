'use client'
import Link from 'next/link'
import Image from 'next/image'
import black_heart from '../../../../public/black_heart.svg'

export default function HeaderHeart() {
  return (
    <Link href={'/favourites'}>
      <button
        className={
          'relative flex items-center gap-2 rounded-full px-4 py-2 font-medium text-primary'}>
        <div className={'h-[24px] w-[24px] sm:h-[24px] sm:w-[24px]'}>
          <Image src={black_heart} alt={'heart'} />
        </div>
      </button>
    </Link>
  )
}
