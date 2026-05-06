import type { IProductReviewsStatistics } from '@/features/reviews/types'

const STAR_PATH =
  'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z'

interface RatingSummaryProps {
  statistics: IProductReviewsStatistics
}

export default function RatingSummary({ statistics }: Readonly<RatingSummaryProps>) {
  const { avgRating, reviewsCount, ratingMap } = statistics
  const display = avgRating.toFixed(1)

  return (
    <div className="flex h-full flex-col rounded-2xl border border-black/6 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-5">
        {/* Big number */}
        <div className="flex flex-col items-center">
          <span className="text-5xl font-bold tracking-tight text-black/80">{display}</span>
          <div className="mt-1.5 flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <svg key={i} className="h-3.5 w-3.5" viewBox="0 0 20 20" fill={i <= Math.round(avgRating) ? '#d97706' : 'rgba(0,0,0,0.1)'}>
                <path d={STAR_PATH} />
              </svg>
            ))}
          </div>
          <span className="mt-1 text-xs text-black/40">
            {reviewsCount} review{reviewsCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Bar chart */}
        <div className="flex flex-1 flex-col gap-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingMap[`star${star}`] ?? 0
            const pct = reviewsCount > 0 ? Math.round((count / reviewsCount) * 100) : 0

            return (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="w-3 text-right font-medium text-black/50">{star}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/[0.06]">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
