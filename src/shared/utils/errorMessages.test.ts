import axios from 'axios'
import { getUserMessage } from '@/shared/utils/errorMessages'

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

describe('getUserMessage', () => {
  it('maps known problem detail types to curated user messages', () => {
    expect(
      getUserMessage(
        makeAxiosError(401, {
          type: 'https://iced-latte.local/problems/session-expired',
          detail: 'raw backend detail',
        }),
      ),
    ).toBe('Your session expired. Please sign in again.')

    expect(
      getUserMessage(
        makeAxiosError(503, {
          type: 'https://iced-latte.local/problems/support-chat-temporarily-unavailable',
          detail: 'Telegram sendMessage failed',
        }),
      ),
    ).toBe('Support is temporarily unavailable. Try again later.')
  })

  it('does not expose unknown backend details directly to users', () => {
    expect(
      getUserMessage(
        makeAxiosError(500, {
          detail: 'NullPointerException at SecretService.java:42',
        }),
      ),
    ).toBe('Something went wrong. Please try again.')
  })
})
