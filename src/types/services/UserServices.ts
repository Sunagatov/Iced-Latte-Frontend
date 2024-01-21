export interface AuthData {
  token: string
}

export interface UserData {
  firstName: string
  lastName: string
  birthDate: string
  phoneNumber: string
  email: string
  address: {
    country: string
    city: string
    line: string
    postcode: string
  }
}
