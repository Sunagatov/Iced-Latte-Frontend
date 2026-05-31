import axios from 'axios'
import { handleAxiosError } from '@/shared/utils/apiError'

function makeAxiosError(status: number, data: Record<string, unknown>) {
  const err = new axios.AxiosError('err')

  err.response = {
    status,
    data,
    headers: {},
    config: {} as never,
    statusText: '',
  }

  return err
}

describe('handleAxiosError', () => {
  it('returns mapped message for 401 when a known type is present', () => {
    expect(
      handleAxiosError(
        makeAxiosError(401, {
          type: 'https://iced-latte.local/problems/session-expired',
          message: 'raw backend message',
        }),
      ),
    ).toBe('Your session expired. Please sign in again.')
  })

  it('returns fallback message for 401 without message', () => {
    expect(handleAxiosError(makeAxiosError(401, {}))).toBe(
      'Please sign in to continue.',
    )
  })

  it('returns mapped message for 403 when a known type is present', () => {
    expect(
      handleAxiosError(
        makeAxiosError(403, {
          type: 'https://iced-latte.local/problems/access-denied',
          message: 'raw backend message',
        }),
      ),
    ).toBe('You do not have permission to perform this action.')
  })

  it('returns fallback message for 403 without message', () => {
    expect(handleAxiosError(makeAxiosError(403, {}))).toBe(
      'You do not have permission to perform this action.',
    )
  })

  it('maps known ProblemDetail type before backend detail text', () => {
    expect(
      handleAxiosError(
        makeAxiosError(400, {
          type: 'https://iced-latte.local/problems/validation-failed',
          detail: 'raw validation internals',
          message: 'old',
        }),
      ),
    ).toBe('Please check the form for errors.')
  })

  it('does not expose backend message for unknown server errors', () => {
    expect(
      handleAxiosError(makeAxiosError(500, { message: 'Server error' })),
    ).toBe('Something went wrong. Please try again.')
  })

  it('does not expose backend error when message is absent', () => {
    expect(handleAxiosError(makeAxiosError(500, { error: 'Oops' }))).toBe(
      'Something went wrong. Please try again.',
    )
  })

  it('returns fallback for unknown error', () => {
    expect(handleAxiosError(new Error('plain'))).toBe(
      'An unknown error occurred',
    )
  })

  it('returns network error for axios error without response', () => {
    const err = new axios.AxiosError('network')

    expect(handleAxiosError(err)).toBe(
      'Network error. Please check your connection.',
    )
  })
})
