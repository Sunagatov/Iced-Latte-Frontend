import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import GuestResetPassForm from '@/features/auth/components/ResetPassword/GuestResetPassForm'
import { apiGuestResetPassword } from '@/features/auth/api'
import axios from 'axios'

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
      target: { value: 'gentle river coffee morning' },
    })
    fireEvent.change(screen.getByLabelText('Confirm new password'), {
      target: { value: 'gentle river coffee morning' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Reset password' }))

    await waitFor(() => {
      expect(apiGuestResetPassword).toHaveBeenCalledWith({
        code: VALID_TOKEN,
        password: 'gentle river coffee morning',
        turnstileToken: '',
      })
    })
  })

  it.each(['1', null])('offers a fresh reset link after an invalid code (stored recovery: %s)', async (recovery) => {
    currentSearchParams = new URLSearchParams(recovery ? 'recovery=1' : `token=${VALID_TOKEN}`)
    const error = new axios.AxiosError('Request failed')

    error.response = {
      status: 400,
      data: { type: 'https://iced-latte.local/problems/invalid-email-token' },
      headers: {},
      config: {} as never,
      statusText: 'Bad Request',
    }
    jest.mocked(apiGuestResetPassword).mockRejectedValue(error)

    render(<GuestResetPassForm />)
    fireEvent.change(screen.getByLabelText('New password'), {
      target: { value: 'gentle river coffee morning' },
    })
    fireEvent.change(screen.getByLabelText('Confirm new password'), {
      target: { value: 'gentle river coffee morning' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Reset password' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'This email code is invalid, expired or already used. Request a new email.',
    )
    expect(screen.getByRole('link', { name: 'Request a new reset link' }))
      .toHaveAttribute('href', '/forgotpass')
    expect(screen.queryByText('Password updated!')).not.toBeInTheDocument()
  })
})
