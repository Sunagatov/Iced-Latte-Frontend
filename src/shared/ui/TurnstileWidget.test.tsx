import { render } from '@testing-library/react'
import { Turnstile } from '@marsidev/react-turnstile'
import TurnstileWidget from '@/shared/ui/TurnstileWidget'

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

    expect(props.options).toEqual(expect.objectContaining({
      appearance: 'always',
      feedbackEnabled: false,
      refreshExpired: 'auto',
      size: 'flexible',
      theme: 'light',
    }))

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
