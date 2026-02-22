import * as yup from 'yup'

const nameRules = (field: string) =>
  yup
    .string()
    .required(`${field} is required`)
    .min(2, `${field} must be at least 2 characters`)
    .max(64, `${field} must be at most 64 characters`)
    .matches(
      /^[a-zA-ZÀ-ÖØ-öø-ÿ\s''-]+$/,
      `${field} can only contain letters, spaces, hyphens, and apostrophes`,
    )

export const registrationSchema = yup.object().shape({
  firstName: nameRules('First name'),
  lastName: nameRules('Last name'),
  email: yup
    .string()
    .required('Email is required')
    .email('Enter a valid email address')
    .max(254, 'Email must be at most 254 characters'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be between 8 and 128 characters')
    .max(128, 'Password must be between 8 and 128 characters')
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least 1 letter, 1 digit, and may include @$!%*?&',
    ),
})
