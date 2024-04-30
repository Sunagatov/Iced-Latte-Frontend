import * as yup from 'yup'

export const confirmPasswordSchema = yup.object().shape({
  confirmPassword: yup
    .string()
    .required('Confirmation code is required')
    .matches(/^\d{9}$/, 'Invalid code format'),
})
