import { UserData } from '@/services/userService'

export interface FormProfileProps {
  onSuccessEdit: () => void
  updateUserData: (userData: UserData | null) => void
  initialUserData: Partial<UserData>
}
