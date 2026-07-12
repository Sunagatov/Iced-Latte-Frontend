import {
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
        password: 'Password1',
        confirmPassword: 'Password1',
      }),
    ).resolves.toMatchObject({ code: VALID_TOKEN })
  })

  it('rejects legacy 9-digit password reset codes', async () => {
    await expect(
      changePassSchema.validate({
        code: '123456789',
        password: 'Password1',
        confirmPassword: 'Password1',
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
        password: 'Password1',
      }),
    ).resolves.toMatchObject({ lastName: 'O’Connor' })
  })
})
