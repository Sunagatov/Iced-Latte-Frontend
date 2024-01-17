import * as yup from 'yup'

export const registrationSchema = yup.object().shape({
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
  password: yup
    .string()
    .required('Password is a required field')
    .min(8, 'Password should have a length between 8 and 128 characters')
    .max(128, 'Password should have a length between 8 and 128 characters')
    .matches(
      /(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z@$!%*?&]{8,}/g,
      'Password should contain at least 1 letter, 1 digit, and may include special characters "@$!%*?&"',
    ),
})
