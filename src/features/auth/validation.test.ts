import {
  authChangePassSchema,
  loginSchema,
  changePassSchema,
  registrationSchema,
  verifyEmailCodeSchema,
} from '@/features/auth/validation'

const VALID_TOKEN = 'A'.repeat(43)

describe('auth validation schemas', () => {
  it('accepts generated 43-character password reset tokens', async () => {
    await expect(
      changePassSchema.validate({
        code: VALID_TOKEN,
        password: 'gentle river coffee morning',
        confirmPassword: 'gentle river coffee morning',
      }),
    ).resolves.toMatchObject({ code: VALID_TOKEN })
  })

  it('rejects legacy 9-digit password reset codes', async () => {
    await expect(
      changePassSchema.validate({
        code: '123456789',
        password: 'gentle river coffee morning',
        confirmPassword: 'gentle river coffee morning',
      }),
    ).rejects.toThrow('Code must be a valid reset token')
  })

  it('accepts generated 43-character email confirmation tokens', async () => {
    await expect(
      verifyEmailCodeSchema.validate({ verificationCode: VALID_TOKEN }),
    ).resolves.toMatchObject({ verificationCode: VALID_TOKEN })
  })

  it('rejects legacy 9-digit email confirmation codes', async () => {
    await expect(
      verifyEmailCodeSchema.validate({ verificationCode: '123456789' }),
    ).rejects.toThrow('Invalid confirmation token format')
  })

  it('accepts typographic apostrophes in registration names', async () => {
    await expect(
      registrationSchema.validate({
        firstName: 'Anne',
        lastName: 'O’Connor',
        email: 'anne@example.com',
        password: 'gentle river coffee morning',
      }),
    ).resolves.toMatchObject({ lastName: 'O’Connor' })
  })
})

describe('password compatibility', () => {
  it('accepts legacy passwords for login and current-password proof', async () => {
    await expect(
      loginSchema.validate({ email: 'user@example.com', password: 'old' }),
    ).resolves.toBeDefined()
    await expect(
      authChangePassSchema.validate({
        oldPassword: 'old',
        newPassword: 'gentle river coffee morning',
      }),
    ).resolves.toBeDefined()
  })
  it('rejects short newly created passwords', async () => {
    await expect(
      registrationSchema.validate({
        firstName: 'Test',
        lastName: 'User',
        email: 'user@example.com',
        password: 'ShortPass1',
      }),
    ).rejects.toThrow('15')
  })
  it.each(['Зуфар', 'Çağrı', '李明', 'E\u0301lodie'])('accepts Unicode registration name %s', async (firstName) => {
    await expect(registrationSchema.validate({ firstName, lastName: 'Sunagatov', email: 'qa@example.invalid', password: 'gentle river coffee morning' })).resolves.toBeDefined()
  })

})
