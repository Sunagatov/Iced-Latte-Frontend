import ResetPassForm from '@/components/Auth/ResetPassword/AuthResetPassForm'
import GuestResetPassForm from '@/components/Auth/ResetPassword/GuestResetPassForm'
import { useAuthStore } from '@/store/authStore'


export default function ResetPass() {

  const { isLoggedIn } = useAuthStore()

  return (
    <>
      {isLoggedIn}? <ResetPassForm /> :
      <GuestResetPassForm />
    </>
  )
}
