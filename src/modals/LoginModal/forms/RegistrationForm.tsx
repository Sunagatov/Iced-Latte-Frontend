import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function RegistrationForm() {
  return (
    <form className="flex flex-col">
      <Input
        name="first_name"
        label='First name'
        placeholder='First name'
      />
      <Input
        name='last_name'
        label='Last name'
        placeholder='Last name'
      />
      <Input
        name='email'
        label='Email address'
        placeholder='Email address'
      />
      <Input
        name='password'
        type = "password"
        label='Password'
        placeholder='Password'
      />
      <Button className='w-full mt-6'>
        Register
      </Button>
    </form>
  )
}