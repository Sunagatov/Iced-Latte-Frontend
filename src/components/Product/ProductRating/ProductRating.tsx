import { IProductRatingProps } from '@/types/ProductRating'

export default function ProductRating({
  rating,
  reviewsCount,
}: Readonly<IProductRatingProps>) {
  return (
    <>
      {rating ? (
        <div className="flex items-center gap-1">
          <div className="flex items-center justify-center rounded bg-brand-second px-1.5 py-1 sm:px-2 sm:py-1.5">
            <span className="text-[10px] font-semibold text-brand sm:text-XS">
              {String(rating).length === 1 ? rating + '.0' : rating}
            </span>
          </div>
          <span className="text-[10px] text-tertiary sm:text-XS">•</span>
          <span className="text-[10px] text-tertiary underline sm:text-XS">
            {reviewsCount} reviews
          </span>
        </div>
      ) : (
        <span className="flex h-[23px] items-center text-[10px] text-tertiary sm:h-[30px] sm:text-XS">
          No rating
        </span>
      )}
    </>
  )
}
