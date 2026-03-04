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
      'Password must contain at least one letter, one number, and be 8+ characters',
    )
    .required('Password is a required field'),
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
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least 1 letter, 1 digit, and may include @$!%*?&',
    ),
})

export const changePassSchema = yup.object().shape({
  code: yup
    .string()
    .required('Code is a required field')
    .matches(/^\d{9}$/, 'Invalid format. Please use this format #########. Enter exactly 9 digits without any separators.'),
  password: yup
    .string()
    .required('Password is a required field')
    .min(8, 'Password should have a length between 8 and 128 characters')
    .max(128, 'Password should have a length between 8 and 128 characters')
    .matches(
      /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z@$!%*?&]{8,}$/,
      'Password should contain at least 1 letter, 1 digit, and may include special characters "@$!%*?&"',
    ),
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
    .matches(
      /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z@$!%*?&]{8,}$/,
      'Old Password should contain at least 1 letter, 1 digit, and may include special characters "@$!%*?&"',
    ),
  newPassword: yup
    .string()
    .required('New Password is a required field')
    .min(8, 'New Password should have a length between 8 and 128 characters')
    .max(128, 'New Password should have a length between 8 and 128 characters')
    .matches(
      /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z@$!%*?&]{8,}$/,
      'New Password should contain at least 1 letter, 1 digit, and may include special characters "@$!%*?&"',
    )
    .notOneOf([yup.ref('oldPassword')], 'New Password must not be the same as Old Password'),
})

export const forgotPassSchema = yup.object().shape({
  email: yup
    .string()
    .email('Invalid email')
    .test('email-format', 'Invalid email format', (value) => {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

      return emailRegex.test(value ?? '')
    })
    .required(),
})

export const confirmPasswordSchema = yup.object().shape({
  confirmPassword: yup
    .string()
    .required('Confirmation code is required')
    .matches(/^\d{9}$/, 'Invalid code format'),
})
