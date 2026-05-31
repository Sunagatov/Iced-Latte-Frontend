import { act, renderHook, waitFor } from '@testing-library/react'
import { type OrderFilter, useOrders } from '@/features/orders/useOrders'
import * as ordersApi from '@/features/orders/ordersApi'
import type { OrderPageDto } from '@/features/orders/orderTypes'

jest.mock('@/features/orders/ordersApi')

const mockedOrdersApi = jest.mocked(ordersApi)

const emptyPage: OrderPageDto = {
  content: [],
  page: 0,
  size: 10,
  totalElements: 0,
  totalPages: 0,
}

describe('useOrders', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('does not clear loading from an aborted stale request while a new request is pending', async () => {
    let rejectFirst!: (reason?: unknown) => void
    let resolveSecond!: (value: OrderPageDto) => void

    mockedOrdersApi.fetchOrders
      .mockReturnValueOnce(
        new Promise((_resolve, reject) => {
          rejectFirst = reject
        }),
      )
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveSecond = resolve
        }),
      )

    const { result, rerender } = renderHook(
      ({ filter }: { filter: OrderFilter }) => useOrders(filter),
      { initialProps: { filter: '' } },
    )

    await waitFor(() => {
      expect(mockedOrdersApi.fetchOrders).toHaveBeenCalledTimes(1)
    })

    rerender({ filter: 'PAID' })

    await waitFor(() => {
      expect(mockedOrdersApi.fetchOrders).toHaveBeenCalledTimes(2)
    })

    await act(async () => {
      rejectFirst({ code: 'ERR_CANCELED' })
    })

    expect(result.current.loading).toBe(true)

    await act(async () => {
      resolveSecond(emptyPage)
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })
})
