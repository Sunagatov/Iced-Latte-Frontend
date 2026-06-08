import {
  cleanSentryDsn,
  parseTelemetrySampleRate,
  sanitizeSentryEvent,
} from '@/shared/config/sentry'

describe('Sentry config helpers', () => {
  it('parses valid sample rates', () => {
    expect(parseTelemetrySampleRate('0')).toBe(0)
    expect(parseTelemetrySampleRate('0.25')).toBe(0.25)
    expect(parseTelemetrySampleRate('1')).toBe(1)
  })

  it('defaults invalid sample rates to zero', () => {
    expect(parseTelemetrySampleRate(undefined)).toBe(0)
    expect(parseTelemetrySampleRate('')).toBe(0)
    expect(parseTelemetrySampleRate('-1')).toBe(0)
    expect(parseTelemetrySampleRate('2')).toBe(0)
    expect(parseTelemetrySampleRate('abc')).toBe(0)
  })

  it('normalizes blank DSNs', () => {
    expect(cleanSentryDsn(undefined)).toBeUndefined()
    expect(cleanSentryDsn('   ')).toBeUndefined()
    expect(cleanSentryDsn(' https://public@sentry.example/1 ')).toBe(
      'https://public@sentry.example/1',
    )
  })

  it('removes sensitive request headers case-insensitively', () => {
    const event = sanitizeSentryEvent({
      type: undefined,
      request: {
        headers: {
          Authorization: 'Bearer token',
          Cookie: 'session=value',
          'x-request-id': 'request-id',
        },
      },
    })

    expect(event.request?.headers).toEqual({
      'x-request-id': 'request-id',
    })
  })
})
