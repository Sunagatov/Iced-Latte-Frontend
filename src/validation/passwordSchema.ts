import * as yup from 'yup'

export const changePassSchema = yup.object().shape({
  code: yup.string().required('Code is required'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)/,
      'Password must contain at least one letter and one digit',
    ),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
})
