import * as yup from 'yup'

const nameRules = (field: string) =>
  yup
    .string()
    .required(`${field} is required`)
    .min(2, `${field} must be at least 2 characters`)
    .max(64, `${field} must be at most 64 characters`)
    .matches(/^[a-zA-ZÀ-ÖØ-öø-ÿ\s''-]+$/, `${field} can only contain letters, spaces, hyphens, and apostrophes`)

export const validationSchema = yup.object().shape({
  firstName: nameRules('First name'),
  lastName: nameRules('Last name'),
  birthDate: yup
    .string()
    .nullable()
    .test('is-past', 'Date of birth must be in the past', (v) => {
      if (!v) return true
      return new Date(v).setHours(0,0,0,0) < new Date().setHours(0,0,0,0)
    })
    .test('min-age', 'You must be at least 13 years old', (v) => {
      if (!v) return true
      const min = new Date()
      min.setFullYear(min.getFullYear() - 13)
      return new Date(v) <= min
    }),
  phoneNumber: yup
    .string()
    .nullable()
    .transform((v) => v === '' ? null : v)
    .matches(/^\+[1-9]\d{6,14}$/, { message: 'Phone must be in international format, e.g. +12025550123', excludeEmptyString: true }),
  address: yup.object().shape({
    country: yup.string().nullable(),
    city: yup.string().nullable().max(128, 'City must be at most 128 characters'),
    line: yup.string().nullable().max(256, 'Address must be at most 256 characters'),
    postcode: yup
      .string()
      .nullable()
      .transform((v) => v === '' ? null : v)
      .max(16, 'Postcode must be at most 16 characters')
      .matches(/^[A-Z0-9\s-]{2,16}$/i, { message: 'Enter a valid postcode', excludeEmptyString: true }),
  }),
})
