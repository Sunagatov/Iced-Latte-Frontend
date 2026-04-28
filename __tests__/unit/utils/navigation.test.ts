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
})
