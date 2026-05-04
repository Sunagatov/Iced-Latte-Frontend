'use client'

import { useState } from 'react'
import Image, { type ImageProps } from 'next/image'
import productImg from '@/../public/coffee.png'
import getImgUrl from '@/shared/utils/getImgUrl'

type Props = Omit<ImageProps, 'src'> & {
  productFileUrl: string | null | undefined
}

export default function ProductImage({ productFileUrl, style, fill, ...props }: Props) {
  const [src, setSrc] = useState(() => getImgUrl(productFileUrl, productImg))
  const autoStyle = fill ? style : { width: 'auto', height: 'auto', ...style }

  return (
    <Image
      {...props}
      fill={fill}
      src={src}
      style={autoStyle}
      onError={() => setSrc(productImg)}
    />
  )
}
