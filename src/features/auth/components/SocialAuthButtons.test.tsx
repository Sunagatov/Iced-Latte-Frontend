import { fireEvent, render, screen } from '@testing-library/react'
import SocialAuthButtons from '@/features/auth/components/SocialAuthButtons'
import { redirectToAuthProvider } from '@/features/auth/redirect'
import { FEATURES } from '@/shared/config/features'

const useSearchParams = jest.fn()
const usePathname = jest.fn()

jest.mock('next/navigation', () => ({
  useSearchParams: () => useSearchParams(),
  usePathname: () => usePathname(),
}))

const getSafeNext = jest.fn((value: string | null) => value)

jest.mock('@/shared/utils/navigation', () => ({
  getSafeNext: (value: string | null) => getSafeNext(value),
}))

jest.mock('@/features/auth/redirect', () => ({
  redirectToAuthProvider: jest.fn(),
}))

jest.mock('@/shared/config/features', () => ({
  FEATURES: {
    googleAuth: true,
    githubAuth: true,
  },
}))

describe('SocialAuthButtons', () => {
  beforeEach(() => {
    useSearchParams.mockReturnValue(new URLSearchParams())
    usePathname.mockReturnValue('/signin')
    getSafeNext.mockImplementation((value: string | null) => value)
    jest.mocked(redirectToAuthProvider).mockClear()
    FEATURES.googleAuth = true
    FEATURES.githubAuth = true
  })

  it('renders nothing when both social auth providers are disabled', () => {
    FEATURES.googleAuth = false
    FEATURES.githubAuth = false

    const { container } = render(<SocialAuthButtons mode="signin" />)

    expect(container).toBeEmptyDOMElement()
  })

  it('renders both providers and enters pending state after click', () => {
    render(<SocialAuthButtons mode="signin" />)

    const githubButton = screen.getByRole('button', {
      name: /continue with github/i,
    })

    fireEvent.click(githubButton)

    expect(redirectToAuthProvider).toHaveBeenCalledWith('/api/auth/github')
    expect(
      screen.getByRole('button', { name: /connecting to github/i }),
    ).toBeDisabled()
  })
})
