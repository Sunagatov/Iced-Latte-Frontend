import { UserData } from '@/services/userService'

export type UserProfileInfoProps = {
  userData: UserData | null
  onEditClick: () => void
  isLoading: boolean
}
