
interface RatingInfoProps {
  currentRating: number;
  count: number;
}

const RatingInfo = ({ currentRating, count }: RatingInfoProps) => {
  return (
    <div>
      <span>{currentRating}/{count}</span>
      {currentRating > 0 && (
        <span>A good choice</span>
      )}
    </div>
  )
}

export default RatingInfo
