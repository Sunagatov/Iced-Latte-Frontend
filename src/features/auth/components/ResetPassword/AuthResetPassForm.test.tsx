import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import AuthResetPassForm from '@/features/auth/components/ResetPassword/AuthResetPassForm'
import { apiAuthChangePassword } from '@/features/auth/api'
import { clearClientSession } from '@/features/session/public'
import { ROUTES } from '@/shared/config/routes'

const mockPush = jest.fn()
const mockBack = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    back: mockBack,
    push: mockPush,
  }),
}))

jest.mock('@/features/auth/api', () => ({
  apiAuthChangePassword: jest.fn(),
}))

jest.mock('@/features/session/public', () => ({
  clearClientSession: jest.fn(),
}))

describe('AuthResetPassForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(apiAuthChangePassword).mockResolvedValue({})
    jest.mocked(clearClientSession).mockResolvedValue(undefined)
  })

  it('shows success and clears the client session after a password change', async () => {
    render(<AuthResetPassForm />)

    fireEvent.change(screen.getByLabelText('Current password'), {
      target: { value: 'OldPass1' },
    })
    fireEvent.change(screen.getByLabelText('New password'), {
      target: { value: 'NewPass1' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Change password' }))

    await waitFor(() => {
      expect(screen.getByText('Password updated!')).toBeInTheDocument()
    })
    expect(clearClientSession).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Sign in again' }))

    expect(mockPush).toHaveBeenCalledWith(ROUTES.signin)
  })

  it('can render the password-changed success state after remount', () => {
    render(<AuthResetPassForm initialChangeSuccessful />)

    expect(screen.getByText('Password updated!')).toBeInTheDocument()
    expect(clearClientSession).not.toHaveBeenCalled()
  })
})
