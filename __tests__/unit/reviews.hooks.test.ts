import { renderHook, act } from '@testing-library/react'
import { useReviews } from '@/features/reviews/hooks'
import * as SWRInfinite from 'swr/infinite'

jest.mock('swr/infinite')

const mockMutate = jest.fn()
const defaultSWRReturn = {
  data: undefined,
  error: undefined,
  isLoading: false,
  size: 1,
  setSize: jest.fn(),
  mutate: mockMutate,
}

const sortOption = { label: 'Newest', value: { sortAttribute: 'createdAt', sortDirection: 'DESC' } }

function makeReview(id: string) {
  return { productReviewId: id, text: 'ok', rating: 5, createdAt: '', authorName: '', likesCount: 0, dislikesCount: 0, userReaction: null }
}

beforeEach(() => {
  jest.spyOn(SWRInfinite, 'default').mockReturnValue(defaultSWRReturn as never)
  mockMutate.mockClear()
})

describe('useReviews', () => {
  it('returns empty data when no pages loaded', () => {
    const { result } = renderHook(() =>
      useReviews({ productId: 'p1', userReview: null, sortOption, ratingFilter: [] }),
    )
    expect(result.current.data).toEqual([])
    expect(result.current.hasNextPage).toBe(false)
  })

  it('deduplicates reviews across pages', () => {
    const review = makeReview('r1')
    jest.spyOn(SWRInfinite, 'default').mockReturnValue({
      ...defaultSWRReturn,
      data: [
        { reviewsWithRatings: [review], page: 0, totalPages: 2, totalElements: 1, size: 3 },
        { reviewsWithRatings: [review], page: 1, totalPages: 2, totalElements: 1, size: 3 },
      ],
    } as never)
    const { result } = renderHook(() =>
      useReviews({ productId: 'p1', userReview: null, sortOption, ratingFilter: [] }),
    )
    expect(result.current.data).toHaveLength(1)
  })

  it('filters out userReview from list', () => {
    const userReview = makeReview('r1')
    const other = makeReview('r2')
    jest.spyOn(SWRInfinite, 'default').mockReturnValue({
      ...defaultSWRReturn,
      data: [{ reviewsWithRatings: [userReview, other], page: 0, totalPages: 1, totalElements: 2, size: 3 }],
    } as never)
    const { result } = renderHook(() =>
      useReviews({ productId: 'p1', userReview, sortOption, ratingFilter: [] }),
    )
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data[0].productReviewId).toBe('r2')
  })

  it('refreshReviews calls mutate', () => {
    const { result } = renderHook(() =>
      useReviews({ productId: 'p1', userReview: null, sortOption, ratingFilter: [] }),
    )
    act(() => { result.current.refreshReviews() })
    expect(mockMutate).toHaveBeenCalled()
  })

  it('removeReviewFromCache calls mutate with updater', () => {
    const { result } = renderHook(() =>
      useReviews({ productId: 'p1', userReview: null, sortOption, ratingFilter: [] }),
    )
    act(() => { result.current.removeReviewFromCache('r1') })
    expect(mockMutate).toHaveBeenCalledWith(expect.any(Function), { revalidate: false })
  })

  it('addReviewToCache calls mutate with updater', () => {
    const { result } = renderHook(() =>
      useReviews({ productId: 'p1', userReview: null, sortOption, ratingFilter: [] }),
    )
    act(() => { result.current.addReviewToCache(makeReview('r3')) })
    expect(mockMutate).toHaveBeenCalledWith(expect.any(Function), { revalidate: true })
  })

  it('updateReviewInCache calls mutate with updater', () => {
    const { result } = renderHook(() =>
      useReviews({ productId: 'p1', userReview: null, sortOption, ratingFilter: [] }),
    )
    act(() => { result.current.updateReviewInCache(makeReview('r1')) })
    expect(mockMutate).toHaveBeenCalledWith(expect.any(Function), { revalidate: false })
  })

  it('includes ratingFilter in SWR key', () => {
    let capturedGetKey: ((i: number, prev: unknown) => string | null) | null = null
    jest.spyOn(SWRInfinite, 'default').mockImplementation((getKey) => {
      capturedGetKey = getKey as typeof capturedGetKey
      return defaultSWRReturn as never
    })
    renderHook(() =>
      useReviews({ productId: 'p1', userReview: null, sortOption, ratingFilter: [4, 5] }),
    )
    const key = capturedGetKey!(0, null)
    expect(key).toContain('productRatings=4,5')
  })
})
