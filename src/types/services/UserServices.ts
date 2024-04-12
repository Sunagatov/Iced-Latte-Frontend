export interface AuthData {
  token: string
}

export interface UserData {
  id: string
  firstName: string
  lastName: string
  birthDate?: string
  phoneNumber: string
  email: string
  avatarLink?: string
  address: {
    country: string
    city: string
    line: string
    postcode: string
  }
}
