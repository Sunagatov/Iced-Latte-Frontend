import { StrictMode } from 'react'
import { render, waitFor } from '@testing-library/react'
import GitHubCallbackPage from './page'

const replace = jest.fn()
const setAuthenticated = jest.fn()
const getUserData = jest.fn()

let currentSearchParams = new URLSearchParams()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => currentSearchParams,
}))

jest.mock('@/features/auth/public', () => ({
  useAuthStore: (selector: (state: { setAuthenticated: jest.Mock }) => unknown) =>
    selector({ setAuthenticated }),
}))

jest.mock('@/features/user/public', () => ({
  getUserData: () => getUserData(),
}))

describe('GitHubCallbackPage', () => {
  beforeEach(() => {
    currentSearchParams = new URLSearchParams()
    replace.mockClear()
    setAuthenticated.mockClear()
    getUserData.mockReset()
    window.history.replaceState(null, '', '/auth/github/callback')
    global.fetch = jest.fn().mockResolvedValue({ ok: true }) as jest.Mock
  })

  it('exchanges the handoff code once under React Strict Mode', async () => {
    const oauthCode = 'A'.repeat(43)

    window.history.replaceState(null, '', `/auth/github/callback#oauthCode=${oauthCode}`)
    getUserData.mockResolvedValue({ id: 'user-1' })

    render(
      <StrictMode>
        <GitHubCallbackPage />
      </StrictMode>,
    )

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/')
    })

    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(global.fetch).toHaveBeenCalledWith(
      `/api/proxy/auth/oauth/token?code=${oauthCode}`,
      {
        credentials: 'same-origin',
        method: 'POST',
      },
    )
    expect(setAuthenticated).toHaveBeenCalledWith({ id: 'user-1' })
  })

  it('preserves a safe next value when redirecting after successful exchange', async () => {
    const oauthCode = 'B'.repeat(43)

    currentSearchParams = new URLSearchParams('next=/checkout?coupon=SAVE10')
    window.history.replaceState(null, '', `/auth/github/callback#oauthCode=${oauthCode}`)
    getUserData.mockResolvedValue({ id: 'user-1' })

    render(<GitHubCallbackPage />)

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/checkout?coupon=SAVE10')
    })
  })

  it('redirects invalid handoff codes to sign in', async () => {
    window.history.replaceState(null, '', '/auth/github/callback#oauthCode=bad')

    render(<GitHubCallbackPage />)

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/signin?error=github_auth_failed')
    })

    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('preserves safe next when the provider returns an error', async () => {
    currentSearchParams = new URLSearchParams('error=access_denied&next=/orders')

    render(<GitHubCallbackPage />)

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith(
        '/signin?error=github_auth_failed&next=%2Forders',
      )
    })

    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('preserves safe next when the handoff exchange fails', async () => {
    const oauthCode = 'C'.repeat(43)

    currentSearchParams = new URLSearchParams('next=/checkout?coupon=SAVE10')
    window.history.replaceState(null, '', `/auth/github/callback#oauthCode=${oauthCode}`)
    jest.mocked(global.fetch).mockResolvedValue({ ok: false } as Response)

    render(<GitHubCallbackPage />)

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith(
        '/signin?error=github_auth_failed&next=%2Fcheckout%3Fcoupon%3DSAVE10',
      )
    })

    expect(setAuthenticated).not.toHaveBeenCalled()
  })
})
