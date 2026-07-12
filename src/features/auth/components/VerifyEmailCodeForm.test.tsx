import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import VerifyEmailCodeForm from '@/features/auth/components/VerifyEmailCodeForm'
import { verifyEmailCode } from '@/features/auth/api'

jest.mock('@/features/auth/api', () => ({
  verifyEmailCode: jest.fn(),
}))

jest.mock('@/features/auth/hooks/useCompleteAuthSession', () => ({
  useCompleteAuthSession: () => ({
    completeAuthSession: jest.fn().mockResolvedValue(undefined),
  }),
}))

function pendingPromise(): Promise<never> {
  return new Promise(() => undefined)
}

describe('VerifyEmailCodeForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('disables submit while confirmation is pending', async () => {
    jest.mocked(verifyEmailCode).mockReturnValue(pendingPromise())

    render(<VerifyEmailCodeForm />)

    fireEvent.change(
      screen.getByLabelText('Enter confirmation token from your email'),
      { target: { value: 'A'.repeat(43) } },
    )

    const submitButton = screen.getByRole('button', {
      name: 'Confirm Registration',
    })

    fireEvent.click(submitButton)

    await waitFor(() => expect(verifyEmailCode).toHaveBeenCalledTimes(1))

    expect(submitButton).toBeDisabled()

    fireEvent.click(submitButton)

    expect(verifyEmailCode).toHaveBeenCalledTimes(1)
  })
})
