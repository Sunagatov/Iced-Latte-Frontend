'use client'
import ReviewForm from '../ReviewForm/ReviewForm'
import type { IProductReviewsStatistics } from '@/features/reviews/types'
import Loader from '@/shared/ui/Loader/Loader'
import ReviewsList from '@/features/reviews/components/ReviewsList/ReviewsList'
import ReviewsSorter from '@/features/reviews/components/ReviewsSorter/ReviewsSorter'
import { IProduct } from '@/features/products/types'
import AIReviewSummary from '@/features/reviews/components/AIReviewSummary/AIReviewSummary'
import ReviewsFilter from '@/features/reviews/components/ReviewsFilter/ReviewsFilter'
import { useReviewsSection } from '@/features/reviews/hooks/useReviewsSection'

interface ReviewComponentProps {
  product: IProduct
  reviewsStatistics: IProductReviewsStatistics | null
  refreshStatistics: () => Promise<void>
}

const ReviewsSection = ({
  product,
  reviewsStatistics,
  refreshStatistics,
}: ReviewComponentProps) => {
  const {
    clearRatingFilters,
    error,
    errorMessage,
    filterRef,
    handleReviewDeleted,
    handleReviewSubmitted,
    handleShowMoreReviews,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    productId,
    refreshReviews,
    reviews,
    reviewsSummary,
    selectedFilterRating,
    selectedSortOption,
    setSelectedSortOption,
    setShowFilterDropdown,
    showFilterDropdown,
    showForm,
    setShowForm,
    toggleRatingFilter,
    updateReviewInCache,
    userReview,
  } = useReviewsSection({
    product,
    reviewsStatistics,
    refreshStatistics,
  })

  if (error) {
    return (
      <div className="rounded-2xl border border-black/8 bg-white p-6 shadow-sm">
        <p className="text-primary text-sm font-medium">
          Failed to load reviews.
        </p>
        <p className="text-tertiary mt-1 text-sm">Please try again.</p>
        <button
          className="bg-brand text-inverted hover:bg-brand-solid-hover mt-4 rounded-xl px-4 py-2 text-sm font-semibold transition"
          onClick={() => void refreshReviews()}
        >
          Retry
        </button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="mt-14 flex h-[54px] items-center justify-center">
        <Loader />
      </div>
    )
  }

  return (
    <div data-testid="reviews-section" className="mx-auto max-w-[1157px] pb-16">
      <h2 className="text-primary mb-8 text-3xl font-bold tracking-tight">
        Rating and reviews
      </h2>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Left: AI summary + write review + reviews list */}
        <div className="flex min-w-0 flex-1 flex-col">
          {product.aiSummary && (
            <div className="mb-6">
              <AIReviewSummary
                summary={product.aiSummary}
                reviewsCount={
                  reviewsStatistics?.reviewsCount ?? product.reviewsCount
                }
              />
            </div>
          )}

          {!userReview && (
            <ReviewForm
              productId={productId}
              showForm={showForm}
              setShowForm={setShowForm}
              onReviewSubmitted={handleReviewSubmitted}
            />
          )}

          {reviewsStatistics && reviewsSummary.hasStatistics && (
            <ReviewsSorter
              selectedOption={selectedSortOption}
              selectOption={setSelectedSortOption}
              userReview={userReview}
            >
              <ReviewsFilter
                filterRef={filterRef}
                reviewsStatistics={reviewsStatistics}
                selectedFilterRating={selectedFilterRating}
                showFilterDropdown={showFilterDropdown}
                setShowFilterDropdown={setShowFilterDropdown}
                toggleRatingFilter={toggleRatingFilter}
                clearRatingFilters={clearRatingFilters}
              />
            </ReviewsSorter>
          )}

          {reviewsSummary.hasAnyReviews ? (
            <ReviewsList
              productId={productId}
              reviews={reviews}
              showMoreReviews={handleShowMoreReviews}
              isFetchingNextPage={isFetchingNextPage}
              hasNextPage={hasNextPage}
              userReview={userReview}
              onReviewDeleted={handleReviewDeleted}
              onReviewRated={(updated) => updateReviewInCache(updated)}
            />
          ) : (
            !isLoading &&
            reviewsSummary.reviewsCount === 0 && (
              <div className="border-primary/60 mt-6 rounded-2xl border bg-white p-8 text-center shadow-sm">
                <p className="text-primary text-base font-semibold">
                  No reviews yet
                </p>
                <p className="text-tertiary mt-1 text-sm">
                  Be the first to review this product
                </p>
              </div>
            )
          )}

          {reviews.length === 0 && selectedFilterRating.length > 0 && (
            <div className="text-tertiary mt-4 flex items-center gap-3 text-sm">
              <span>No reviews match this filter.</span>
              <button
                onClick={clearRatingFilters}
                className="text-brand font-medium hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
          {errorMessage && (
            <div className="text-negative mt-4">{errorMessage}</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReviewsSection
