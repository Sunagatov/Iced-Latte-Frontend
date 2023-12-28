import * as yup from 'yup'

const emailRegex =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g

const nameRegex = /^(?!\\s)(?!.*\\s$)(?!.*?--)[A-Za-z\\s-]*$/

export const registrationSchema = yup.object().shape({
  firstName: yup
    .string()
    .required('First name is a required field')
    .min(2, 'First name should have a length between 2 and 128 characters')
    .max(128, 'First name should have a length between 2 and 128 characters')
    .matches(
      nameRegex,
      'First name can contain Latin letters, spaces, and hyphens',
    ),
  lastName: yup
    .string()
    .required('Last name is a required field')
    .min(2, 'Last name should have a length between 2 and 128 characters')
    .max(128, 'Last name should have a length between 2 and 128 characters')
    .matches(
      nameRegex,
      'Last name can contain Latin letters, spaces, and hyphens',
    ),
  email: yup
    .string()
    .required('Email is a required field')
    .email('Invalid email')
    .matches(emailRegex, 'Invalid email'),
  password: yup
    .string()
    .required('Password is a required field')
    .min(8, 'Password should have a length between 8 and 128 characters')
    .max(128, 'Password should have a length between 8 and 128 characters')
    .matches(
      /(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z@$!%*?&]{8,}/g,
      'Password should contain at least 1 letter, 1 digit, and may include special characters "@$!%*?&"',
    ),
})
