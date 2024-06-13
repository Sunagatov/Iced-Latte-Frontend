import * as yup from 'yup'

export const personalDetailsSchema = yup.object().shape({
  firstName: yup
    .string()
    .required('Name is required')
    .min(2, 'Name should be at least 2 characters')
    .max(128, 'Name should not exceed 128 characters')
    .matches(
      /^[a-zA-Z-'.]+$/,
      `Invalid name format. Use Latin letters and special characters (-'.)`,
    ),
  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name should be at least 2 characters')
    .max(128, 'Last name should not exceed 128 characters')
    .matches(
      /^[a-zA-Z-'.]+$/,
      `Invalid last name format. Use Latin letters and special characters (-'.)`,
    ),

  birthDate: yup.string().nullable(),
  phoneNumber: yup
    .string()
    .nullable()
    .matches(
      /^[+0-9]{9,}$/,
      'Invalid phone number format. Use only digits and + sign, with a minimum of 9 digits',
    ),
})

export const deliveryAddressSchema = yup.object().shape({
  address: yup
    .object()
    .shape({
      country: yup.string().nullable(),
      city: yup.string().nullable(),
      line: yup.string().nullable(),
      postcode: yup
        .string()
        .nullable()
        .matches(/^(\d+)?$/, 'Invalid postcode format. Use only digits'),
    })
    .required(),
})

export const loginSecuritySchema = yup.object().shape({
  email: yup
    .string()
    .email('Invalid email')
    .max(64, 'Email should not exceed 64 characters')
    .test(
      'email-format',
      'Invalid email format',
      (value: string | undefined) => {
        const emailRegex =
          /^[-!#$%&'*+/=?^_`{|}~A-Za-z0-9]+(?:\.[-!#$%&'*+/=?^_`{|}~A-Za-z0-9]+)*@([A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9]/

        return emailRegex.test(value ?? '')
      },
    )
    .required(),
  password: yup.string(),
})
