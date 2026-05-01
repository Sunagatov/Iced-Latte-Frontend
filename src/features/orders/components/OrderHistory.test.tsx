import { render, waitFor } from '@testing-library/react'
import OrderHistory from '@/features/orders/components/OrderHistory'
import { api } from '@/shared/api/client'

jest.mock('@/shared/api/client', () => ({
  api: { get: jest.fn() },
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

const mockedApi = api as jest.Mocked<typeof api>

describe('OrderHistory', () => {
  beforeEach(() => jest.clearAllMocks())

  it('loads orders with cache disabled', async () => {
    ;(mockedApi.get as jest.Mock).mockResolvedValue({
      data: [],
    })

    render(<OrderHistory />)

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalledWith(
        '/orders',
        expect.objectContaining({ cache: false, signal: expect.any(AbortSignal) }),
      )
    })
  })
})
