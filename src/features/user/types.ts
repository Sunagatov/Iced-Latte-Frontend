export interface UserData {
  firstName: string
  lastName: string
  birthDate?: string | null
  phoneNumber?: string | null
  email: string
  avatarLink?: string
  oauthUser?: boolean
  address: {
    country?: string | null
    city?: string | null
    line?: string | null
    postcode?: string | null
  }
}
