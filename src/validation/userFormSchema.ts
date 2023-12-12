import * as yup from 'yup'

export const validationSchema = yup.object().shape({
  firstName: yup
    .string()
    .min(4, 'Name should be at least 4 characters')
    .max(64, 'Name should not exceed 64 characters')
    .matches(
      /^[a-zA-Zа-яА-ЯёЁ][a-zA-Zа-яА-ЯёЁ0-9.%+\-_]*( [a-zA-Zа-яА-ЯёЁ0-9.%+\-_]+)?$/,
      'Invalid name format',
    )
    .required('name is required'),
  lastName: yup
    .string()
    .min(4, 'last name should be at least 4 characters')
    .max(64, 'last name should not exceed 64 characters')
    .matches(
      /^[a-zA-Zа-яА-ЯёЁ][a-zA-Zа-яА-ЯёЁ0-9.%+\-_]*( [a-zA-Zа-яА-ЯёЁ0-9.%+\-_]+)?$/,
      'Invalid last name format',
    )
    .required('last name is required'),
  birthDate: yup
    .string()
    .required('Date of birth is required')
    .matches(
      /^(19|20)\d\d-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/,
      'Incorrect date format. Use YYYY-MM-DD',
    ),
  phoneNumber: yup.string().required('Phone number is required'),
  email: yup
    .string()
    .email('Invalid email')
    .test(
      'email-format',
      'Invalid email format',
      (value: string | undefined) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

        return emailRegex.test(value || '')
      },
    )
    .required(),
  address: yup.object().shape({
    country: yup.string().required('Country is required'),
    city: yup.string().required('City is required'),
    line: yup.string().required('Address is required'),
    postcode: yup.string().required('Postcode is required'),
  }),
})
