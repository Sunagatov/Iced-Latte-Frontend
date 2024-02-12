import * as yup from 'yup'

export const validationSchema = yup.object().shape({
  firstName: yup
    .string()
    .required('name is required')
    .max(255, 'name should not exceed 255 characters')
    .matches(
      /^[a-zA-Z\u0080-\u00FF\-."':;, ]+$/,
      'Invalid name format. Use extended Latin letters, spaces, and specified symbols',
    ),
  lastName: yup
    .string()
    .required('Last name is required')
    .max(255, 'Last name should not exceed 255 characters')
    .matches(
      /^[a-zA-Z\u0080-\u00FF]+$/,
      'Invalid Last name format. Use extended Latin letters',
    ),

  birthDate: yup.string(),
  phoneNumber: yup
    .string()
    .required('Phone number is required')
    .matches(
      /^[+0-9]{9,}$/,
      'Invalid phone number format. Use only digits and + sign, with a minimum of 9 digits',
    ),
  email: yup
    .string()
    .email('Invalid email')
    .test(
      'email-format',
      'Invalid email format',
      (value: string | undefined) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

        return emailRegex.test(value ?? '')
      },
    )
    .required(),
  address: yup.object().shape({
    country: yup.string().required('Country is required'),
    city: yup.string().required('City is required'),
    line: yup.string().required('Address is required'),
    postcode: yup
      .string()
      .required('Postcode is required')
      .matches(/^\d+$/, 'Invalid postcode format. Use only digits'),
  }),
})
