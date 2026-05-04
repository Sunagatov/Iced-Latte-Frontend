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
  it('returns backend message for 401 when present', () => {
    expect(
      handleAxiosError(
        makeAxiosError(401, { message: 'Session expired. Please sign in again.' }),
      ),
    ).toBe('Session expired. Please sign in again.')
  })

  it('returns fallback message for 401 without message', () => {
    expect(handleAxiosError(makeAxiosError(401, {}))).toBe(
      'Please sign in to continue.',
    )
  })

  it('returns backend message for 403 when present', () => {
    expect(
      handleAxiosError(makeAxiosError(403, { message: 'Access denied.' })),
    ).toBe('Access denied.')
  })

  it('returns fallback message for 403 without message', () => {
    expect(handleAxiosError(makeAxiosError(403, {}))).toBe(
      'You do not have permission to perform this action.',
    )
  })

  it('prefers detail over message (ProblemDetail)', () => {
    expect(
      handleAxiosError(
        makeAxiosError(400, { detail: 'Validation failed', message: 'old' }),
      ),
    ).toBe('Validation failed')
  })

  it('returns data.message for other status', () => {
    expect(
      handleAxiosError(makeAxiosError(500, { message: 'Server error' })),
    ).toBe('Server error')
  })

  it('returns data.error when message is absent', () => {
    expect(handleAxiosError(makeAxiosError(500, { error: 'Oops' }))).toBe(
      'Oops',
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
