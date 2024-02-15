
interface RatingInfoProps {
  currentRating: number;
  count: number;
}

const RatingInfo = ({ currentRating, count }: RatingInfoProps) => {
  return (
    <div className='flex items-center'>
      <span className='font-medium text-[36px] text-primary mr-[24px]'>{currentRating}/{count}</span>
      {currentRating > 0 && (
        <span className='font-medium text-[18px] text-tertiary'>A good choice</span>
      )}
    </div>
  )
}

export default RatingInfo
