'use client'

import Loader from '@/shared/ui/Loader'

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
        <div className="mt-8 flex flex-col items-center gap-2">
          <button
            className="group flex items-center gap-2 text-[13px] font-medium text-black/40 transition hover:text-[#1B4332]"
            onClick={onLoadMore}
          >
            Load more
            <svg className="h-4 w-4 transition-transform group-hover:translate-y-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 9l-7 7-7-7" />
            </svg>
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
