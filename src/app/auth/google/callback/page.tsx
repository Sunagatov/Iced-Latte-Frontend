import OAuthCallbackPage from '@/features/auth/components/OAuthCallbackPage'

const GOOGLE_AUTH_FAILED_ERROR = 'google_auth_failed'

export default function GoogleCallbackPage() {
  return <OAuthCallbackPage authFailedError={GOOGLE_AUTH_FAILED_ERROR} />
}
