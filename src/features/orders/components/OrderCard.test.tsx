import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import OrderCard from '@/features/orders/components/OrderCard'
import * as ordersApi from '@/features/orders/ordersApi'
import { type CartSliceStore, useCartStore } from '@/features/cart/cartStore'
import type { OrderDetailDto, OrderSummaryDto } from '@/features/orders/orderTypes'

const push = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

jest.mock('@/features/orders/ordersApi')

const mockedOrdersApi = jest.mocked(ordersApi)
const originalHydrate = useCartStore.getState().hydrate

const order: OrderSummaryDto = {
  id: 'order-123456',
  status: 'PAID',
  createdAt: '2026-05-01T12:00:00Z',
  itemsQuantity: 1,
  itemsTotalPrice: 12,
  firstItemName: 'Coffee',
  itemCount: 1,
}

const detail: OrderDetailDto = {
  ...order,
  items: [
    {
      id: 'item-1',
      productId: 'product-1',
      productName: 'Coffee',
      productPrice: 12,
      productsQuantity: 1,
    },
  ],
  canCancel: false,
  canRefund: false,
}

describe('OrderCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(window, 'alert').mockImplementation(() => {})
    useCartStore.getState().resetCart()
  })

  afterEach(() => {
    cleanup()
    useCartStore.setState({ hydrate: originalHydrate } as Partial<CartSliceStore>)
    jest.restoreAllMocks()
  })

  it('hydrates the cart after a successful reorder before routing to cart', async () => {
    const hydrate = jest.fn().mockResolvedValue(undefined)

    useCartStore.setState({ hydrate } as Partial<CartSliceStore>)

    mockedOrdersApi.fetchOrder.mockResolvedValue(detail)
    mockedOrdersApi.reorderOrder.mockResolvedValue({
      addedItems: 1,
      unavailableItems: [],
    })

    render(<OrderCard order={order} />)

    fireEvent.click(screen.getByRole('button', { name: /order #order-12/i }))

    await screen.findByRole('button', { name: /buy again/i })

    fireEvent.click(screen.getByRole('button', { name: /buy again/i }))

    await waitFor(() => {
      expect(hydrate).toHaveBeenCalled()
    })
    expect(push).toHaveBeenCalledWith('/cart')
  })

  it('does not report reorder failure when only cart hydration fails', async () => {
    const hydrate = jest.fn().mockRejectedValue(new Error('hydrate failed'))

    useCartStore.setState({ hydrate } as Partial<CartSliceStore>)

    mockedOrdersApi.fetchOrder.mockResolvedValue(detail)
    mockedOrdersApi.reorderOrder.mockResolvedValue({
      addedItems: 1,
      unavailableItems: [],
    })

    render(<OrderCard order={order} />)

    fireEvent.click(screen.getByRole('button', { name: /order #order-12/i }))

    await screen.findByRole('button', { name: /buy again/i })

    fireEvent.click(screen.getByRole('button', { name: /buy again/i }))

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/cart')
    })

    expect(screen.queryByText('Could not re-order.')).not.toBeInTheDocument()
  })
})
