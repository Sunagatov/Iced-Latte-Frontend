export interface IChangeValues {
  code: string
  password: string
  confirmPassword: string
}

export interface IForgotValues {
  email: string
}

export interface IChangeAuthValues {
  oldPassword: string
  newPassword: string
}
