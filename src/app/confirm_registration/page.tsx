import ConfirmPasswordComponent from '../../components/Auth/ConfirmPassword/ConfirmPasswordComponent'
import RestrictRoute from '@/Context/RestrictRoute'

const ConfirmPasswordPage = () => {
  return (
    <RestrictRoute parallel={null}>
      <section className="ml-auto mr-auto min-h-screen max-w-[800px] pb-[40px] pl-[10px] pr-[10px] pt-[40px] md:pl-[10px] md:pr-[10px]">
        <ConfirmPasswordComponent />
      </section>
    </RestrictRoute>
  )
}

export default ConfirmPasswordPage
