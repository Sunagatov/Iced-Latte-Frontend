import { getSafeNext } from '@/shared/utils/navigation'

describe('getSafeNext', () => {
  it('accepts internal paths', () => {
    expect(getSafeNext('/checkout')).toBe('/checkout')
  })

  it('preserves safe query strings and fragments', () => {
    expect(getSafeNext('/checkout?coupon=SAVE10#summary')).toBe(
      '/checkout?coupon=SAVE10#summary',
    )
  })

  it('rejects absolute external urls', () => {
    expect(getSafeNext('https://evil.com')).toBeNull()
  })

  it('rejects protocol-relative urls', () => {
    expect(getSafeNext('//evil.com')).toBeNull()
  })

  it('rejects backslash-based paths', () => {
    expect(getSafeNext('/\\evil')).toBeNull()
  })

  it('rejects paths with leading or trailing whitespace', () => {
    expect(getSafeNext(' /checkout')).toBeNull()
    expect(getSafeNext('/checkout ')).toBeNull()
  })

  it('rejects paths with control characters', () => {
    expect(getSafeNext('/checkout\n')).toBeNull()
    expect(getSafeNext('/checkout\u0000')).toBeNull()
  })

  it('rejects encoded control characters and path separators', () => {
    expect(getSafeNext('/checkout%0a')).toBeNull()
    expect(getSafeNext('/checkout%00')).toBeNull()
    expect(getSafeNext('/%2f%2fevil.com')).toBeNull()
    expect(getSafeNext('/%5Cevil')).toBeNull()
  })
})
