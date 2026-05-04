import { createCheckout, getCheckoutStatus } from '@/features/payment/paymentApi'
import { api } from '@/shared/api/client'

jest.mock('@/shared/api/client', () => ({
  api: { get: jest.fn(), post: jest.fn() },
}))

const mockedApi = api as jest.Mocked<typeof api>

describe('paymentApi', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('createCheckout', () => {
    it('sends POST /payment/checkout with Idempotency-Key header', async () => {
      const payload = { recipientName: 'John', recipientSurname: 'Doe' }
      const response = { orderId: 'o1', stripeSessionId: 'cs_test', checkoutUrl: 'https://checkout.stripe.com/test' }

      ;(mockedApi.post as jest.Mock).mockResolvedValue({ data: response })

      const result = await createCheckout(payload, 'key-123')

      expect(mockedApi.post).toHaveBeenCalledWith(
        '/payment/checkout',
        payload,
        { headers: { 'Idempotency-Key': 'key-123' } },
      )
      expect(result).toEqual(response)
    })
  })

  describe('getCheckoutStatus', () => {
    it('sends GET /payment/checkout/{orderId}/status with no cache', async () => {
      const status = { orderId: 'o1', orderStatus: 'PAID', paymentStatus: 'PAID' }
      const signal = new AbortController().signal

      ;(mockedApi.get as jest.Mock).mockResolvedValue({ data: status })

      const result = await getCheckoutStatus('o1', signal)

      expect(mockedApi.get).toHaveBeenCalledWith(
        '/payment/checkout/o1/status',
        { cache: false, signal },
      )
      expect(result).toEqual(status)
    })
  })
})
