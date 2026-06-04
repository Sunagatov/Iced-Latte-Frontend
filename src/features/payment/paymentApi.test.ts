import { createCheckout, getCheckoutStatus } from '@/features/payment/paymentApi'
import { api } from '@/shared/api/client'

jest.mock('@/shared/api/client', () => ({
  api: jest.fn(),
}))

const mockedApi = jest.mocked(api)

describe('paymentApi', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('createCheckout', () => {
    it('sends POST /payment/checkout with Idempotency-Key header', async () => {
      const payload = {
        recipientName: 'John',
        recipientSurname: 'Doe',
        turnstileToken: 'turnstile-token',
      }
      const response = { orderId: 'o1', stripeSessionId: 'cs_test', checkoutUrl: 'https://checkout.stripe.com/test' }

      mockedApi.mockResolvedValue({ data: response })

      const result = await createCheckout(payload, 'key-123')

      expect(mockedApi).toHaveBeenCalledWith({
        data: payload,
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': 'key-123',
        },
        method: 'POST',
        url: '/payment/checkout',
      })
      expect(result).toEqual(response)
    })
  })

  describe('getCheckoutStatus', () => {
    it('sends GET /payment/checkout/{orderId}/status with no cache', async () => {
      const status = { orderId: 'o1', orderStatus: 'PAID', paymentStatus: 'PAID' }
      const signal = new AbortController().signal

      mockedApi.mockResolvedValue({ data: status })

      const result = await getCheckoutStatus('o1', signal)

      expect(mockedApi).toHaveBeenCalledWith(expect.objectContaining({
        cache: false,
        method: 'GET',
        signal,
        url: '/payment/checkout/o1/status',
      }))
      expect(result).toEqual(status)
    })
  })
})
