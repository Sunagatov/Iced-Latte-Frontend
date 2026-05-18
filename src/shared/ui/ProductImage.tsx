'use client'

import { useState } from 'react'
import Image, { type ImageProps } from 'next/image'
import productImg from '@/../public/coffee.png'
import getImgUrl from '@/shared/utils/getImgUrl'

type Props = Omit<ImageProps, 'src'> & {
  productFileUrl: string | null | undefined
}

export default function ProductImage({ alt = '', productFileUrl, ...props }: Props) {
  const [src, setSrc] = useState(() => getImgUrl(productFileUrl, productImg))

  return (
    <Image
      {...props}
      alt={alt}
      src={src}
      onError={() => setSrc(productImg)}
    />
  )
}
