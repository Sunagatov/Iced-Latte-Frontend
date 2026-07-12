import { ROUTES } from '@/shared/config/routes'

export function getProductReviewSignInUrl(productId: string): string {
  return `${ROUTES.signin}?next=${encodeURIComponent(ROUTES.product(productId))}`
}
