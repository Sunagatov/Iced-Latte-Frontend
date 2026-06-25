import {
  buildGoogleAnalyticsItem,
  buildGoogleAnalyticsItems,
  trackGoogleAnalyticsEvent,
} from '@/shared/analytics/googleAnalytics'

describe('google analytics helpers', () => {
  afterEach(() => {
    delete (window as Window & { gtag?: unknown }).gtag
  })

  it('builds ga4 ecommerce items from cart items', () => {
    const items = buildGoogleAnalyticsItems([
      {
        productInfo: {
          id: 'p1',
          name: 'Cold Brew',
          price: 12.5,
          brandName: 'Iced Latte',
        },
        productQuantity: 2,
      },
    ])

    expect(items).toEqual([
      {
        item_id: 'p1',
        item_name: 'Cold Brew',
        item_brand: 'Iced Latte',
        price: 12.5,
        quantity: 2,
      },
    ])
  })

  it('forwards events to gtag when available', () => {
    const gtag = jest.fn()
    ;(window as Window & { gtag?: typeof gtag }).gtag = gtag

    trackGoogleAnalyticsEvent('add_to_cart', {
      currency: 'USD',
      items: [
        buildGoogleAnalyticsItem({
          id: 'p1',
          name: 'Cold Brew',
          price: 12.5,
          quantity: 1,
        }),
      ],
    })

    expect(gtag).toHaveBeenCalledWith('event', 'add_to_cart', {
      currency: 'USD',
      items: [
        {
          item_id: 'p1',
          item_name: 'Cold Brew',
          price: 12.5,
          quantity: 1,
        },
      ],
    })
  })

  it('does nothing when gtag is unavailable', () => {
    expect(() =>
      trackGoogleAnalyticsEvent('begin_checkout', { currency: 'USD' }),
    ).not.toThrow()
  })

  it('does not throw when gtag itself fails', () => {
    const gtag = jest.fn(() => {
      throw new Error('blocked')
    })
    ;(window as Window & { gtag?: typeof gtag }).gtag = gtag

    expect(() =>
      trackGoogleAnalyticsEvent('begin_checkout', { currency: 'USD' }),
    ).not.toThrow()
  })
})
