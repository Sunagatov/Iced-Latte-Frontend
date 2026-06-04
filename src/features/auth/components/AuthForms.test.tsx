import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import LoginForm from '@/features/auth/components/LoginForm'
import RegistrationForm from '@/features/auth/components/RegistrationForm'
import { apiLoginUser, apiRegisterUser } from '@/features/auth/api'

jest.mock('@/features/auth/api', () => ({
  apiLoginUser: jest.fn(),
  apiRegisterUser: jest.fn(),
}))

jest.mock('@/features/auth/hooks/useCompleteAuthSession', () => ({
  useCompleteAuthSession: () => ({
    completeAuthSession: jest.fn().mockResolvedValue(undefined),
  }),
}))

const mockRouterPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
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

function pendingPromise(): Promise<never> {
  return new Promise(() => undefined)
}

describe('auth submit forms', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('disables login submit while authentication is pending', async () => {
    jest.mocked(apiLoginUser).mockReturnValue(pendingPromise())

    render(<LoginForm />)

    fireEvent.change(screen.getByLabelText('Enter your email address'), {
      target: { value: 'user@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password' },
    })

    const submitButton = screen.getByRole('button', { name: 'Login' })

    fireEvent.click(submitButton)

    await waitFor(() => expect(apiLoginUser).toHaveBeenCalledTimes(1))

    expect(submitButton).toBeDisabled()

    fireEvent.click(submitButton)

    expect(apiLoginUser).toHaveBeenCalledTimes(1)
  })

  it('disables registration submit while registration is pending', async () => {
    jest.mocked(apiRegisterUser).mockReturnValue(pendingPromise())

    render(<RegistrationForm />)

    fireEvent.change(screen.getByLabelText('First name'), {
      target: { value: 'Jane' },
    })
    fireEvent.change(screen.getByLabelText('Last name'), {
      target: { value: 'Latte' },
    })
    fireEvent.change(screen.getByLabelText('Email address'), {
      target: { value: 'jane@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'Password1' },
    })

    const submitButton = screen.getByRole('button', { name: 'Register' })

    fireEvent.click(submitButton)

    await waitFor(() => expect(apiRegisterUser).toHaveBeenCalledTimes(1))

    expect(submitButton).toBeDisabled()

    fireEvent.click(submitButton)

    expect(apiRegisterUser).toHaveBeenCalledTimes(1)
  })
})
