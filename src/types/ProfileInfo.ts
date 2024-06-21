import { UserData } from './services/UserServices'

export type UserProfileInfoProps = {
  userData: Partial<UserData> | null
  onEditClick: () => void
}
