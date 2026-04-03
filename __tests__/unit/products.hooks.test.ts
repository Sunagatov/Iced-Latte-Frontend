import { renderHook } from '@testing-library/react'
import { useProducts } from '@/features/products/hooks'
import * as SWRInfinite from 'swr/infinite'
import * as useHooks from 'usehooks-ts'

jest.mock('swr/infinite')
jest.mock('usehooks-ts', () => ({ useMediaQuery: jest.fn() }))

const mockSetSize = jest.fn()
const defaultSWRReturn = {
  data: undefined,
  error: undefined,
  isLoading: false,
  size: 1,
  setSize: mockSetSize,
}

const sortOption = { isDefault: true, label: 'Default', value: { sortAttribute: 'name', sortDirection: 'asc' as const } }

function makeProduct(id: string) {
  return { id, name: 'p', description: '', price: 10, quantity: 1, active: true, productFileUrl: null, averageRating: 0, reviewsCount: 0, brandName: 'b', sellerName: 's' }
}

beforeEach(() => {
  jest.spyOn(SWRInfinite, 'default').mockReturnValue(defaultSWRReturn as never)
  jest.spyOn(useHooks, 'useMediaQuery').mockReturnValue(false)
  mockSetSize.mockClear()
})

describe('useProducts', () => {
  it('returns empty data when no pages', () => {
    const { result } = renderHook(() =>
      useProducts(sortOption, [], [], '', '', null, ''),
    )
    expect(result.current.data).toEqual([])
    expect(result.current.hasNextPage).toBe(false)
  })

  it('deduplicates products across pages', () => {
    const p = makeProduct('p1')
    jest.spyOn(SWRInfinite, 'default').mockReturnValue({
      ...defaultSWRReturn,
      data: [
        { products: [p], page: 0, totalPages: 2, totalElements: 1, size: 6 },
        { products: [p], page: 1, totalPages: 2, totalElements: 1, size: 6 },
      ],
    } as never)
    const { result } = renderHook(() =>
      useProducts(sortOption, [], [], '', '', null, ''),
    )
    expect(result.current.data).toHaveLength(1)
  })

  it('fetchNext increments size', () => {
    const { result } = renderHook(() =>
      useProducts(sortOption, [], [], '', '', null, ''),
    )
    result.current.fetchNext()
    expect(mockSetSize).toHaveBeenCalled()
  })

  it('includes brand and seller in SWR key', () => {
    let capturedGetKey: ((i: number, prev: unknown) => string | null) | null = null
    jest.spyOn(SWRInfinite, 'default').mockImplementation((getKey) => {
      capturedGetKey = getKey as typeof capturedGetKey
      return defaultSWRReturn as never
    })
    renderHook(() =>
      useProducts(sortOption, ['BrandA'], ['SellerX'], '', '', null, ''),
    )
    const key = capturedGetKey!(0, null)
    expect(key).toContain('brand_names=BrandA')
    expect(key).toContain('seller_names=SellerX')
  })

  it('returns null key when last page reached', () => {
    let capturedGetKey: ((i: number, prev: unknown) => string | null) | null = null
    jest.spyOn(SWRInfinite, 'default').mockImplementation((getKey) => {
      capturedGetKey = getKey as typeof capturedGetKey
      return defaultSWRReturn as never
    })
    renderHook(() => useProducts(sortOption, [], [], '', '', null, ''))
    const key = capturedGetKey!(1, { products: [], page: 1, totalPages: 2, totalElements: 0, size: 6 })
    expect(key).toBeNull()
  })

  it('uses size 8 on wide screens', () => {
    jest.spyOn(useHooks, 'useMediaQuery').mockReturnValue(true)
    let capturedGetKey: ((i: number, prev: unknown) => string | null) | null = null
    jest.spyOn(SWRInfinite, 'default').mockImplementation((getKey) => {
      capturedGetKey = getKey as typeof capturedGetKey
      return defaultSWRReturn as never
    })
    renderHook(() => useProducts(sortOption, [], [], '', '', null, ''))
    const key = capturedGetKey!(0, null)
    expect(key).toContain('size=8')
  })
})
