import VerifyEmailCodeForm from '@/features/auth/components/VerifyEmailCode/VerifyEmailCodeForm'
import RestrictRoute from '@/shared/providers/RestrictRoute'

const ConfirmPasswordPage = () => {
  return (
    <RestrictRoute>
      <section className="ml-auto mr-auto min-h-screen max-w-[800px] pb-[40px] pl-[10px] pr-[10px] pt-[40px] md:pl-[10px] md:pr-[10px]">
        <VerifyEmailCodeForm />
      </section>
    </RestrictRoute>
  )
}

export default ConfirmPasswordPage
