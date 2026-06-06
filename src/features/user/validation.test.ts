import { validationSchema } from '@/features/user/validation'

describe('user validation schema', () => {
  it('accepts typographic apostrophes in profile names', async () => {
    await expect(
      validationSchema.validate({
        firstName: 'Anne',
        lastName: 'O’Connor',
      }),
    ).resolves.toMatchObject({ lastName: 'O’Connor' })
  })
})
