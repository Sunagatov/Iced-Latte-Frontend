import { render, screen, waitFor } from '@testing-library/react'
import type * as React from 'react'
import OrderHistory from '@/features/orders/components/OrderHistory'
import * as ordersApi from '@/features/orders/ordersApi'

jest.mock('@/features/orders/ordersApi')

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

const mockedOrdersApi = jest.mocked(ordersApi)

describe('OrderHistory', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders filters for all user-visible backend order statuses', async () => {
    mockedOrdersApi.fetchOrders.mockResolvedValue({
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    })

    render(<OrderHistory />)

    await waitFor(() => expect(mockedOrdersApi.fetchOrders).toHaveBeenCalled())

    expect(screen.getByRole('button', { name: 'Refund requested' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Refunded' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Payment failed' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Payment expired' })).toBeInTheDocument()
  })

  it('loads orders through the orders api', async () => {
    mockedOrdersApi.fetchOrders.mockResolvedValue({
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    })

    render(<OrderHistory />)

    await waitFor(() => {
      expect(mockedOrdersApi.fetchOrders).toHaveBeenCalledWith(
        expect.objectContaining({ page: 0, size: 10 }),
        expect.anything(),
      )
    })
  })
})
