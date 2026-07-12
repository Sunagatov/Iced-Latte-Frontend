import VerifyEmailCodeForm from '@/features/auth/components/VerifyEmailCodeForm'
import RestrictRoute from '@/features/auth/RestrictRoute'

export default function ConfirmRegistrationPage() {
  return (
    <RestrictRoute>
      <section className="mr-auto ml-auto min-h-screen max-w-[800px] pt-[40px] pr-[10px] pb-[40px] pl-[10px] md:pr-[10px] md:pl-[10px]">
        <VerifyEmailCodeForm />
      </section>
    </RestrictRoute>
  )
}
