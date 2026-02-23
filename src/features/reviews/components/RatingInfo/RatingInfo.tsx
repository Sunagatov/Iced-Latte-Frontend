interface RatingInfoProps {
  currentRating: number
}

const RatingInfo = ({ currentRating }: RatingInfoProps) => {
  return (
    <div className="flex items-center">
      <span className="mr-[24px] text-[36px] font-medium text-primary">
        {currentRating}
      </span>
      {currentRating > 0 && (
        <span className="absolute bottom-[-25px] left-0 text-[18px] font-medium text-tertiary sm:static">
          A good choice{' '}
        </span>
      )}
    </div>
  )
}

export default RatingInfo
