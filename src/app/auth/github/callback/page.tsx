import OAuthCallbackPage from '@/features/auth/components/OAuthCallbackPage'

const GITHUB_AUTH_FAILED_ERROR = 'github_auth_failed'

export default function GitHubCallbackPage() {
  return <OAuthCallbackPage authFailedError={GITHUB_AUTH_FAILED_ERROR} />
}
