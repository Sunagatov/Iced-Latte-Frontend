import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type * as React from 'react'
import OrderHistory from '@/features/orders/components/OrderHistory'
import * as ordersApi from '@/features/orders/ordersApi'
import { useAuthStore } from '@/features/auth/store'

jest.mock('@/features/orders/ordersApi')

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

const mockedOrdersApi = jest.mocked(ordersApi)

describe('OrderHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useAuthStore
      .getState()
      .setAuthenticated({ email: 'orders@example.invalid' } as never)
  })

  it('does not load private orders before authentication has resolved', () => {
    useAuthStore.getState().setLoading()
    render(<OrderHistory />)
    expect(mockedOrdersApi.fetchOrders).not.toHaveBeenCalled()
  })

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

    expect(
      screen.getByRole('button', { name: 'Refund requested' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Refunded' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Payment failed' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Payment expired' }),
    ).toBeInTheDocument()
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
  it('distinguishes an empty filtered result and lets the user clear it', async () => {
    mockedOrdersApi.fetchOrders.mockResolvedValue({ content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 })
    render(<OrderHistory />)
    await screen.findByText('No orders yet')
    fireEvent.click(screen.getByRole('button', { name: 'Refunded' }))
    await screen.findByText('No orders match these filters')
    expect(screen.queryByText('No orders yet')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
    await screen.findByText('No orders yet')
  })

})
