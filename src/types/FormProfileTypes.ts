import { UserData } from './services/UserServices'

export interface FormProfileProps {
  onSuccessEdit: () => void
  updateUserData: (userData: UserData | null) => void
  initialUserData: Partial<UserData>
}

export type ValuePiece = Date | null

export type Value = ValuePiece | [ValuePiece, ValuePiece]
