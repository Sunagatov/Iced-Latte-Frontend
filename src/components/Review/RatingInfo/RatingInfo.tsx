
interface RatingInfoProps {
  currentRating: number;
}

const RatingInfo = ({ currentRating }: RatingInfoProps) => {
  return (
    <div className='flex items-center'>
      <span className='font-medium text-[36px] text-primary mr-[24px]'>{currentRating}</span>
      {currentRating > 0 && (
        <span className='font-medium text-[18px] text-tertiary absolute left-0 bottom-[-25px] sm:static'>A good choice</span>
      )}
    </div>
  )
}

export default RatingInfo
