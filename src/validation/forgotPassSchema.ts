import * as yup from 'yup'

export const forgotPassSchema = yup.object().shape({
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
})
