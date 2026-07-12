import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import ForgotPassForm from '@/features/auth/components/ResetPassword/ForgotPassForm'
import { apiForgotPassword } from '@/features/auth/api'

const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

jest.mock('@/features/auth/api', () => ({
  apiForgotPassword: jest.fn(),
}))

jest.mock('@/shared/config/features', () => ({
  FEATURES: {
    emailConfirmation: true,
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

describe('ForgotPassForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.history.replaceState(null, '', '/forgotpass')
    jest.mocked(apiForgotPassword).mockResolvedValue({})
  })

  it('does not prefill email from the URL query string', () => {
    window.history.replaceState(
      null,
      '',
      '/forgotpass?email=private@example.com',
    )

    render(<ForgotPassForm />)

    expect(screen.getByLabelText('Email address')).toHaveValue('')
  })

  it('marks the email field with email autocomplete', () => {
    render(<ForgotPassForm />)

    expect(screen.getByLabelText('Email address')).toHaveAttribute(
      'autocomplete',
      'email',
    )
  })

  it('submits the entered email', async () => {
    render(<ForgotPassForm />)

    fireEvent.change(screen.getByLabelText('Email address'), {
      target: { value: 'user@example.com' },
    })
    fireEvent.click(screen.getByRole('button', {
      name: 'Send reset instructions',
    }))

    await waitFor(() => {
      expect(apiForgotPassword).toHaveBeenCalledWith({
        email: 'user@example.com',
        turnstileToken: '',
      })
    })
  })
})
