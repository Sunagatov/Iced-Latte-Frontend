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
            className="h-11 rounded-full border border-[#1B4332]/30 px-8 text-sm font-medium text-[#1B4332] transition-all duration-200 hover:bg-[#F0F7F4] focus-visible:ring-2 focus-visible:ring-[#1B4332]/30 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98]"
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
