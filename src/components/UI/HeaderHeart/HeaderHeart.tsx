'use client'
import Link from 'next/link'
import Image from 'next/image'
import heart_black from '../../../../public/heart_black.svg'
import heart_purple from '../../../../public/heart_purple.svg'
import { usePathname } from 'next/navigation'

export default function HeaderHeart() {
  const pathname = usePathname()

  const imageUrl = pathname === '/favourites' ? heart_purple : heart_black

  return (
    <Link className="inline-flex" href={'/favourites'}>
      <Image src={imageUrl} alt={'heart'} />
    </Link>
  )
}
