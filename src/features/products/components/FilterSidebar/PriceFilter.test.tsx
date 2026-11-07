import { act, fireEvent, render, screen } from '@testing-library/react'
import PriceFilter from './PriceFilter'
import { useProductFiltersStore } from '@/features/products/store'
import { PRICE_FILTER_DEBOUNCE_MS } from '@/shared/config/constants'

it.each(['', '10'])(
  'keeps cleared filters cleared during a pending edit (original value %s)',
  (original) => {
    jest.useFakeTimers()
    try {
      useProductFiltersStore.getState().resetFilters()
      useProductFiltersStore
        .getState()
        .setFilters({ fromPriceFilter: original })
      render(<PriceFilter />)
      fireEvent.change(screen.getByPlaceholderText('Min'), {
        target: { value: '20' },
      })
      act(() => useProductFiltersStore.getState().resetFilters())
      expect(screen.getByPlaceholderText('Min')).toHaveValue('')
      act(() => jest.advanceTimersByTime(PRICE_FILTER_DEBOUNCE_MS + 1))
      expect(useProductFiltersStore.getState().fromPriceFilter).toBe('')
    } finally {
      jest.useRealTimers()
    }
  },
)
