export interface AuthData {
  token: string
}

export interface UserData {
  id?: string
  firstName: string
  lastName: string
  birthDate?: string | null
  phoneNumber?: string | null
  email: string
  avatarLink?: string
  address: {
    country?: string | null
    city?: string | null
    line?: string | null
    postcode?: string | null
  }
}
