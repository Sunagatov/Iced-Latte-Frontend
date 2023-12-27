'use client'

import ButtonHeart from '@/components/Heart/ButtonHeart'

type ButtonHeartProps = {
  className?: string
  id: string
}

export default function HeartWrapper({ id, className }: ButtonHeartProps) {
  return <ButtonHeart id={id} className={className} />
}
