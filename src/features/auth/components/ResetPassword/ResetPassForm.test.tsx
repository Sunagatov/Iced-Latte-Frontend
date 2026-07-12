import { render, waitFor } from '@testing-library/react'
import ResetPassForm from '@/features/auth/components/ResetPassword/ResetPassForm'
import { ROUTES } from '@/shared/config/routes'

const mockReplace = jest.fn()

type MockAuthState = {
  status: 'anonymous' | 'authenticated' | 'loading'
  userData: null | {
    email: string
    oauthUser: boolean
  }
}

let mockAuthState: MockAuthState = {
  status: 'anonymous',
  userData: null,
}

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}))

jest.mock('@/features/auth/public', () => ({
  useAuthStore: (selector: (state: typeof mockAuthState) => unknown) =>
    selector(mockAuthState),
}))

jest.mock('@/features/auth/components/ResetPassword/AuthResetPassForm', () => ({
  __esModule: true,
  default: () => <div>auth reset form</div>,
}))

jest.mock('@/features/auth/components/ResetPassword/GuestResetPassForm', () => ({
  __esModule: true,
  default: () => <div>guest reset form</div>,
}))

jest.mock('@/shared/ui/Loader', () => ({
  __esModule: true,
  default: () => <div>loader</div>,
}))

describe('ResetPassForm', () => {
  beforeEach(() => {
    mockReplace.mockClear()
    mockAuthState = {
      status: 'anonymous',
      userData: null,
    }
  })

  it('redirects OAuth users to forgot password without putting email in the URL', async () => {
    mockAuthState = {
      status: 'authenticated',
      userData: {
        email: 'oauth@example.com',
        oauthUser: true,
      },
    }

    render(<ResetPassForm />)

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith(ROUTES.forgotpass))
    expect(mockReplace).not.toHaveBeenCalledWith(
      expect.stringContaining('oauth@example.com'),
    )
  })

  it('shows a loader while auth state is still resolving', () => {
    mockAuthState = {
      status: 'loading',
      userData: null,
    }

    const { getByText } = render(<ResetPassForm />)

    expect(getByText('loader')).toBeInTheDocument()
  })
})
