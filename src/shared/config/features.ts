export const FEATURES = {
  googleAuth: process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === 'true',
  stripe: process.env.NEXT_PUBLIC_STRIPE_ENABLED === 'true',
  ai: process.env.NEXT_PUBLIC_AI_ENABLED === 'true',
  emailConfirmation: process.env.NEXT_PUBLIC_EMAIL_CONFIRMATION_ENABLED === 'true',
}
