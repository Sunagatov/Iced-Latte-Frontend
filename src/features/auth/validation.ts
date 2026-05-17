import * as yup from 'yup'

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
const PASSWORD_HINT =
  'Password must contain at least 1 lowercase letter, 1 uppercase letter, and 1 digit'

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required')
    .email('Enter a valid email address')
    .max(254, 'Email must be at most 254 characters'),
  password: yup
    .string()
    .required('Password is a required field')
    .min(1, 'Password is a required field')
    .max(128, 'Password must be at most 128 characters'),
})

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
    .matches(PASSWORD_REGEX, PASSWORD_HINT),
})

export const changePassSchema = yup.object().shape({
  code: yup
    .string()
    .required('Code is required')
    .matches(/^\d{9}$/, 'Code must be exactly 9 digits'),
  password: yup
    .string()
    .required('Password is a required field')
    .min(8, 'Password should have a length between 8 and 128 characters')
    .max(128, 'Password should have a length between 8 and 128 characters')
    .matches(PASSWORD_REGEX, PASSWORD_HINT),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
})

export const authChangePassSchema = yup.object().shape({
  oldPassword: yup
    .string()
    .required('Old Password is a required field')
    .min(8, 'Old Password should have a length between 8 and 128 characters')
    .max(128, 'Old Password should have a length between 8 and 128 characters')
    .matches(PASSWORD_REGEX, PASSWORD_HINT),
  newPassword: yup
    .string()
    .required('New Password is a required field')
    .min(8, 'New Password should have a length between 8 and 128 characters')
    .max(128, 'New Password should have a length between 8 and 128 characters')
    .matches(PASSWORD_REGEX, PASSWORD_HINT)
    .notOneOf(
      [yup.ref('oldPassword')],
      'New Password must not be the same as Old Password',
    ),
})

export const forgotPassSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required')
    .email('Enter a valid email address')
    .max(254, 'Email must be at most 254 characters'),
})

export const verifyEmailCodeSchema = yup.object().shape({
  verificationCode: yup
    .string()
    .required('Confirmation code is required')
    .matches(/^\d{9}$/, 'Invalid code format'),
})

/** @deprecated use verifyEmailCodeSchema */
export const confirmPasswordSchema = yup.object().shape({
  confirmPassword: yup
    .string()
    .required('Confirmation code is required')
    .matches(/^\d{9}$/, 'Invalid code format'),
})
