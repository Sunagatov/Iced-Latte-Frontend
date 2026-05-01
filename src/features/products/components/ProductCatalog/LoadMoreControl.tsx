'use client'

import Loader from '@/shared/ui/Loader/Loader'

type LoadMoreControlProps = {
  isFetchingNextPage: boolean
  isVisible: boolean
  loadMoreError: boolean
  onLoadMore: () => void
}

export default function LoadMoreControl({
  isFetchingNextPage,
  isVisible,
  loadMoreError,
  onLoadMore,
}: Readonly<LoadMoreControlProps>) {
  return (
    <>
      {isVisible && (
        <div className="mt-[24px] flex flex-col items-center gap-2">
          <button
            className="border-brand-solid text-L text-brand-solid hover:bg-brand-solid focus-visible:ring-brand-solid h-[54px] w-[160px] rounded-[46px] border-2 font-semibold shadow-sm transition-all duration-200 hover:text-white hover:shadow-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-95"
            onClick={onLoadMore}
          >
            Show more
          </button>
          {loadMoreError && (
            <p className="text-xs text-red-500">
              Failed to load more.{` `}
              <button className="underline hover:opacity-70" onClick={onLoadMore}>
                Retry
              </button>
            </p>
          )}
        </div>
      )}

      {isFetchingNextPage && (
        <div className="mt-[24px] flex h-[54px] items-center">
          <Loader />
        </div>
      )}
    </>
  )
}
