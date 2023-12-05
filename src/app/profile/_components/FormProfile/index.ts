import { UserData } from '@/services/authAndUserService'

export interface FormProfileProps {
  onSuccessEdit: () => void
  updateUserData: (userData: UserData | null) => void
}
