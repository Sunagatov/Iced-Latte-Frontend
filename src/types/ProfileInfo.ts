import { UserData } from './services/UserServices'

export type UserProfileInfoProps = {
  userData: UserData | null
  onEditClick: () => void
  isLoading: boolean
}
