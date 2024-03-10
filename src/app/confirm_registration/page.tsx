import ConfirmPasswordComponent from '../../components/Auth/ConfirmPassword/ConfirmPasswordComponent'
import RestrictRoute from '@/Context/RestrictRoute'

const ConfirmPasswordPage = () => {

  return (
    <RestrictRoute >
      <section className='pt-[40px] pb-[40px] min-h-screen ml-auto mr-auto max-w-[800px] pl-[10px] pr-[10px] md:pl-[10px] md:pr-[10px]'>
        <ConfirmPasswordComponent />
      </section>
    </RestrictRoute>
  )
}

export default ConfirmPasswordPage