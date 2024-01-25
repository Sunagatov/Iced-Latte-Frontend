import * as yup from 'yup'

export const confirmPasswordSchema = yup.object().shape({
  confirmPassword: yup
    .string()
    .required('Password is a required field')
    .matches(/^\d{3}-\d{3}-\d{3}$/, 'Invalid format. Use ###-###-###'),
})
