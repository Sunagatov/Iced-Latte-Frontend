interface IProductRatingProps {
  rating: number
  reviewsCount: number
}

export default function ProductRating({
  rating,
  reviewsCount,
}: Readonly<IProductRatingProps>) {
  return (
    <>
      {rating ? (
        <div className="flex items-center gap-1">
          <div className="bg-brand-second flex items-center justify-center rounded px-1.5 py-1 sm:px-2 sm:py-1.5">
            <span className="text-brand sm:text-XS text-[10px] font-semibold">
              {String(rating).length === 1 ? rating + '.0' : rating}
            </span>
          </div>
          <span className="text-tertiary sm:text-XS text-[10px]">•</span>
          <span className="text-tertiary sm:text-XS text-[10px]">
            {reviewsCount} reviews
          </span>
        </div>
      ) : (
        <span className="sm:text-XS flex h-[23px] items-center text-[10px] text-black/30 sm:h-[30px]">
          No reviews yet
        </span>
      )}
    </>
  )
}
