'use client'
import { useHeartStore } from '@/store/heartStore'
import HeartButton from './HeartButton'
import useStore from '@/store/useStore'

const HeartContainer: React.FC = () => {
  const isHeartActive = useStore(useHeartStore, (state) => state.isHeartActive)
  const toggleHeart = useHeartStore((state) => state.toggleHeart)

  return (
    <HeartButton active={isHeartActive} onClick={toggleHeart} className="" />
  )
}

export default HeartContainer
