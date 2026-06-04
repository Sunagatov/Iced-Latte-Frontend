export const FEATURES = {
  googleAuth: process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === 'true',
  stripe: process.env.NEXT_PUBLIC_STRIPE_ENABLED === 'true',
  ai: process.env.NEXT_PUBLIC_AI_ENABLED === 'true',
  emailConfirmation: process.env.NEXT_PUBLIC_EMAIL_CONFIRMATION_ENABLED === 'true',
  turnstile: !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  checkoutTurnstile:
    !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY &&
    process.env.NEXT_PUBLIC_TURNSTILE_CHECKOUT_ENABLED === 'true',
  reviewsTurnstile:
    !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY &&
    process.env.NEXT_PUBLIC_TURNSTILE_REVIEWS_ENABLED === 'true',
  avatarTurnstile:
    !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY &&
    process.env.NEXT_PUBLIC_TURNSTILE_AVATAR_ENABLED === 'true',
}
