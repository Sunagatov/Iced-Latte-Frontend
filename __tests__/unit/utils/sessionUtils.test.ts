import { getSessionId, generateTraceId } from '../../../src/shared/utils/sessionUtils'

describe('getSessionId', () => {
  beforeEach(() => localStorage.clear())

  it('generates and stores a session id', () => {
    const id = getSessionId()

    expect(id).toBeTruthy()
    expect(localStorage.getItem('il_session_id')).toBe(id)
  })

  it('returns the same id on subsequent calls', () => {
    expect(getSessionId()).toBe(getSessionId())
  })
})

describe('generateTraceId', () => {
  it('returns a non-empty string', () => {
    expect(generateTraceId()).toBeTruthy()
  })

  it('returns unique values', () => {
    expect(generateTraceId()).not.toBe(generateTraceId())
  })
})
