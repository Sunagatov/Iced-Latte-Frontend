import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import GuestResetPassForm from '@/features/auth/components/ResetPassword/GuestResetPassForm'
import { apiGuestResetPassword } from '@/features/auth/api'

const mockBack = jest.fn()
const mockPush = jest.fn()
let currentSearchParams = new URLSearchParams()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    back: mockBack,
    push: mockPush,
  }),
  useSearchParams: () => currentSearchParams,
}))

jest.mock('@/features/auth/api', () => ({
  apiGuestResetPassword: jest.fn(),
}))

jest.mock('@/shared/config/features', () => ({
  FEATURES: {
    turnstile: false,
  },
}))

jest.mock('@/shared/ui/TurnstileWidget', () => {
  const React = jest.requireActual('react')
  const MockTurnstileWidget = React.forwardRef(() => null)

  MockTurnstileWidget.displayName = 'MockTurnstileWidget'

  return {
    __esModule: true,
    default: MockTurnstileWidget,
  }
})

const VALID_TOKEN = 'A'.repeat(43)

describe('GuestResetPassForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    currentSearchParams = new URLSearchParams()
    jest.mocked(apiGuestResetPassword).mockResolvedValue({})
  })

  it('keeps the code field visible when the URL token is invalid', () => {
    currentSearchParams = new URLSearchParams('token=fake-reset-token')

    render(<GuestResetPassForm />)

    expect(screen.getByLabelText('Code from email')).toBeVisible()
  })

  it('uses a valid URL token without showing the code field', async () => {
    currentSearchParams = new URLSearchParams(`token=${VALID_TOKEN}`)

    render(<GuestResetPassForm />)

    expect(screen.queryByLabelText('Code from email')).not.toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('New password'), {
      target: { value: 'Password1' },
    })
    fireEvent.change(screen.getByLabelText('Confirm new password'), {
      target: { value: 'Password1' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Reset password' }))

    await waitFor(() => {
      expect(apiGuestResetPassword).toHaveBeenCalledWith({
        code: VALID_TOKEN,
        password: 'Password1',
        turnstileToken: '',
      })
    })
  })
})
