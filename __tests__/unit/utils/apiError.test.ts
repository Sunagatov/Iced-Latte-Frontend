import axios from 'axios'
import { handleAxiosError } from '../../../src/shared/utils/apiError'

function makeAxiosError(status: number, data: Record<string, unknown>) {
  const err = new axios.AxiosError('err')

  err.response = { status, data, headers: {}, config: {} as never, statusText: '' }

  return err
}

describe('handleAxiosError', () => {
  it('returns normalized message for 401 regardless of backend payload', () => {
    expect(handleAxiosError(makeAxiosError(401, { message: 'Bad creds' }))).toBe('Incorrect email or password')
  })

  it('returns default message for 401 without message', () => {
    expect(handleAxiosError(makeAxiosError(401, {}))).toBe('Incorrect email or password')
  })

  it('returns rejection message for 422', () => {
    expect(handleAxiosError(makeAxiosError(422, {}))).toBe(
      'Your review was rejected — it may contain inappropriate content.',
    )
  })

  it('returns data.message for other status', () => {
    expect(handleAxiosError(makeAxiosError(500, { message: 'Server error' }))).toBe('Server error')
  })

  it('returns data.error when message is absent', () => {
    expect(handleAxiosError(makeAxiosError(500, { error: 'Oops' }))).toBe('Oops')
  })

  it('returns fallback for unknown error', () => {
    expect(handleAxiosError(new Error('plain'))).toBe('An unknown error occurred')
  })

  it('returns fallback for axios error without response', () => {
    const err = new axios.AxiosError('network')

    expect(handleAxiosError(err)).toBe('An unknown error occurred')
  })
})
