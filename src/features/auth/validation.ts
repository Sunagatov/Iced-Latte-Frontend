import { STORED_RECOVERY_TOKEN } from '@/shared/auth/flowCookies'
import * as yup from 'yup'

const URL_SAFE_TOKEN_REGEX = /^[A-Za-z0-9_-]{43}$/

export function isUrlSafeToken(
  value: string | null | undefined,
): value is string {
  return typeof value === 'string' && URL_SAFE_TOKEN_REGEX.test(value)
}

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
      /^[a-zA-ZÀ-ÖØ-öø-ÿ\s'’-]+$/,
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
    .min(15, 'Use at least 15 characters; a long passphrase works well')
    .max(128, 'Password must be at most 128 characters'),
})

export const changePassSchema = yup.object().shape({
  code: yup
    .string()
    .required('Code is required')
    .test(
      'reset-token',
      'Code must be a valid reset token',
      (value) => isUrlSafeToken(value) || value === STORED_RECOVERY_TOKEN,
    ),
  password: yup
    .string()
    .required('Password is a required field')
    .min(15, 'Use at least 15 characters; a long passphrase works well')
    .max(128, 'Password must be at most 128 characters'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
})

export const authChangePassSchema = yup.object().shape({
  oldPassword: yup
    .string()
    .required('Old Password is a required field')
    .min(1, 'Old Password is a required field')
    .max(128, 'Old Password must be at most 128 characters'),
  newPassword: yup
    .string()
    .required('New Password is a required field')
    .min(15, 'Use at least 15 characters; a long passphrase works well')
    .max(128, 'Password must be at most 128 characters')

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
    .matches(URL_SAFE_TOKEN_REGEX, 'Invalid confirmation token format'),
})
