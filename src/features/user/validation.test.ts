import { validationSchema } from '@/features/user/validation'

describe('user validation schema', () => {
  it.each(['country', 'city', 'line', 'postcode'] as const)(
    'rejects a partial address missing %s',
    async (field) => {
      const address = {
        country: 'UK',
        city: 'London',
        line: '221B Baker Street',
        postcode: 'NW1',
      }

      address[field] = ''
      await expect(
        validationSchema.validate({
          firstName: 'Jane',
          lastName: 'Doe',
          address,
        }),
      ).rejects.toMatchObject({ path: `address.${field}` })
    },
  )

  it('allows clearing every address field', async () => {
    await expect(
      validationSchema.validate({
        firstName: 'Jane',
        lastName: 'Doe',
        address: { country: '', city: '', line: '', postcode: '' },
      }),
    ).resolves.toBeDefined()
  })
  it('accepts typographic apostrophes in profile names', async () => {
    await expect(
      validationSchema.validate({
        firstName: 'Anne',
        lastName: 'O’Connor',
      }),
    ).resolves.toMatchObject({ lastName: 'O’Connor' })
  })
  it.each(['Зуфар', 'Çağrı', '李明', 'E\u0301lodie'])('accepts Unicode profile name %s', async (firstName) => {
    await expect(validationSchema.validate({ firstName, lastName: 'Sunagatov' })).resolves.toBeDefined()
  })

})
