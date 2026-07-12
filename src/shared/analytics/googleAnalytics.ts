type GoogleAnalyticsValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<unknown>
  | Record<string, unknown>

export type GoogleAnalyticsEventParams = Record<string, GoogleAnalyticsValue>

export interface GoogleAnalyticsItem {
  item_brand?: string
  item_id: string
  item_name: string
  price: number
  quantity: number
}

type AnalyticsCartItem = {
  productInfo: {
    brandName?: string | null
    id: string
    name: string
    price: number
  }
  productQuantity: number
}

export function buildGoogleAnalyticsItem({
  brandName,
  id,
  name,
  price,
  quantity,
}: {
  brandName?: string | null
  id: string
  name: string
  price: number
  quantity: number
}): GoogleAnalyticsItem {
  const item: GoogleAnalyticsItem = {
    item_id: id,
    item_name: name,
    price,
    quantity,
  }

  if (brandName) {
    item.item_brand = brandName
  }

  return item
}

export function buildGoogleAnalyticsItems(
  items: readonly AnalyticsCartItem[],
): GoogleAnalyticsItem[] {
  return items.map((item) =>
    buildGoogleAnalyticsItem({
      brandName: item.productInfo.brandName,
      id: item.productInfo.id,
      name: item.productInfo.name,
      price: item.productInfo.price,
      quantity: item.productQuantity,
    }),
  )
}

export function trackGoogleAnalyticsEvent(
  eventName: string,
  params: GoogleAnalyticsEventParams = {},
): void {
  if (typeof window === 'undefined') {
    return
  }

  const gtag = (window as typeof window & {
    gtag?: (command: 'event', eventName: string, params?: GoogleAnalyticsEventParams) => void
  }).gtag

  if (typeof gtag !== 'function') {
    return
  }

  try {
    gtag('event', eventName, params)
  } catch {
    return
  }
}
