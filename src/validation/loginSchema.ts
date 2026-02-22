import * as yup from 'yup'

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required')
    .email('Enter a valid email address')
    .max(254, 'Email must be at most 254 characters'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one letter, one number, and be 8+ characters'
    )
    .required('Password is a required field'),
})
