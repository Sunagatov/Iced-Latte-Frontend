'use client'
import type { IProduct } from '@/features/products/types'
import ReviewForm from './ReviewForm'
import type { IProductReviewsStatistics } from '@/features/reviews/types'
import Loader from '@/shared/ui/Loader'
import ReviewsList from '@/features/reviews/components/ReviewsList/ReviewsList'
import ReviewsSorter from '@/features/reviews/components/ReviewsSorter'
import AIReviewSummary from '@/features/reviews/components/AIReviewSummary/AIReviewSummary'
import { FEATURES } from '@/shared/config/features'
import ReviewsFilter from '@/features/reviews/components/ReviewsFilter'
import RatingSummary from '@/features/reviews/components/RatingSummary'
import { useReviewsSectionController } from '@/features/reviews/useReviewsSectionController'

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
  const { id: productId } = product
  const {
    clearRatingFilters,
    errorMessage,
    filterRef,
    handleReviewDeleted,
    handleReviewSubmitted,
    handleShowMoreReviews,
    reviewsState,
    reviewsSummary,
    selectedFilterRating,
    selectedSortOption,
    isUserReviewLoading,
    userReviewError,
    refreshUserReview,
    setSelectedSortOption,
    setShowFilterDropdown,
    setShowForm,
    showFilterDropdown,
    showForm,
    toggleRatingFilter,
    userReview,
  } = useReviewsSectionController({
    productId,
    reviewsStatistics,
    refreshStatistics,
  })

  if (
    reviewsState.error &&
    reviewsState.data.length === 0 &&
    !showForm &&
    !userReview
  ) {
    return (
      <div className="rounded-2xl border border-black/8 bg-white p-6 shadow-sm">
        <p className="text-primary text-sm font-medium">
          Failed to load reviews.
        </p>
        <p className="text-tertiary mt-1 text-sm">Please try again.</p>
        <button
          className="bg-brand text-inverted hover:bg-brand-solid-hover mt-4 rounded-xl px-4 py-2 text-sm font-semibold transition"
          onClick={() => void reviewsState.refreshReviews()}
        >
          Retry
        </button>
      </div>
    )
  }

  const matchingOwnReview =
    userReview &&
    (!selectedFilterRating.length ||
      selectedFilterRating.includes(userReview.productRating ?? 0))
      ? userReview
      : null
  const showSummary =
    FEATURES.ai && product.aiSummary && reviewsSummary.reviewsCount > 0

  return (
    <div data-testid="reviews-section" className="mx-auto max-w-[1157px] pb-16">
      <div className="mb-8 border-t border-black/[0.06] pt-8">
        <h2 className="text-lg font-semibold text-black/70">
          Rating and reviews
        </h2>
      </div>

      {/* 2-col header: Rating summary + AI summary */}
      {reviewsSummary.hasStatistics && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          {reviewsStatistics && (
            <RatingSummary statistics={reviewsStatistics} />
          )}
          {showSummary && product.aiSummary && (
            <AIReviewSummary
              summary={product.aiSummary}
              reviewsCount={
                reviewsStatistics?.reviewsCount ?? product.reviewsCount
              }
            />
          )}
        </div>
      )}

      {/* AI summary full-width fallback when no statistics */}
      {!reviewsSummary.hasStatistics && showSummary && product.aiSummary && (
        <div className="mb-8">
          <AIReviewSummary
            summary={product.aiSummary}
            reviewsCount={
              reviewsStatistics?.reviewsCount ?? product.reviewsCount
            }
          />
        </div>
      )}

      {userReviewError && (
        <div role="alert" className="mb-4 text-sm">
          {userReviewError}{' '}
          <button
            onClick={() => void refreshUserReview()}
            className="text-brand underline"
          >
            Retry checking your review
          </button>
        </div>
      )}
      {!userReview && !isUserReviewLoading && !userReviewError && (
        <ReviewForm
          productId={productId}
          showForm={showForm}
          setShowForm={setShowForm}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}

      {(reviewsSummary.hasStatistics ||
        reviewsState.data.length > 0 ||
        userReview) && (
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
          reviews={reviewsState.data}
          showMoreReviews={handleShowMoreReviews}
          isFetchingNextPage={reviewsState.isFetchingNextPage}
          hasNextPage={reviewsState.hasNextPage}
          userReview={matchingOwnReview}
          onReviewDeleted={handleReviewDeleted}
          onReviewRated={(updated) => reviewsState.updateReviewInCache(updated)}
        />
      ) : (
        !reviewsState.isLoading &&
        reviewsSummary.reviewsCount === 0 && (
          <div className="mt-6 rounded-2xl border border-black/6 bg-white p-8 text-center shadow-sm">
            <p className="text-primary text-base font-semibold">
              No reviews yet
            </p>
            <p className="text-tertiary mt-1 text-sm">
              Be the first to review this product
            </p>
          </div>
        )
      )}

      {reviewsState.isLoading && <Loader />}
      {reviewsState.error && reviewsState.data.length > 0 && (
        <div role="alert" className="mt-4 text-sm">
          Could not load more reviews.{' '}
          <button
            onClick={() => void reviewsState.refreshReviews()}
            className="text-brand underline"
          >
            Retry loading reviews
          </button>
        </div>
      )}
      {!reviewsState.isLoading &&
        reviewsState.data.length === 0 &&
        !matchingOwnReview &&
        selectedFilterRating.length > 0 && (
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
      {errorMessage && <div className="text-negative mt-4">{errorMessage}</div>}
    </div>
  )
}

export default ReviewsSection
