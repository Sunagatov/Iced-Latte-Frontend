import { render } from '@testing-library/react'
import TurnstileWidget from '@/features/auth/components/TurnstileWidget'
import { Turnstile } from '@marsidev/react-turnstile'

jest.mock('@/shared/config/features', () => ({
  FEATURES: { turnstile: true },
}))

jest.mock('@marsidev/react-turnstile', () => ({
  Turnstile: jest.fn(() => <div data-testid="turnstile" />),
}))

describe('TurnstileWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('clears the token for non-success Turnstile lifecycle events', () => {
    const onVerify = jest.fn()

    render(<TurnstileWidget onVerify={onVerify} />)

    const props = jest.mocked(Turnstile).mock.calls[0][0]

    props.onSuccess?.('verified-token')
    props.onExpire?.('expired-token')
    props.onError?.('network-error')
    props.onTimeout?.()
    props.onUnsupported?.()

    expect(onVerify).toHaveBeenNthCalledWith(1, 'verified-token')
    expect(onVerify).toHaveBeenNthCalledWith(2, '')
    expect(onVerify).toHaveBeenNthCalledWith(3, '')
    expect(onVerify).toHaveBeenNthCalledWith(4, '')
    expect(onVerify).toHaveBeenNthCalledWith(5, '')
  })
})
