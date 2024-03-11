import * as yup from 'yup'

export const changePassSchema = yup.object().shape({
  code: yup
    .string()
    .required('Code is a required field')
    .matches(/^\d{3}-\d{3}-\d{3}$/, 'Invalid format. Use ###-###-###'),
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
    .oneOf(
      [yup.ref('oldPassword')],
      'New Password must not be the same as Old Password',
    )
    .required('New Password is a required field'),
})
