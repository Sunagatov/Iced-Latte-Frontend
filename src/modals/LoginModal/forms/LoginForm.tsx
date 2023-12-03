import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useForm } from 'react-hook-form';

export default function LoginForm() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const onSubmit = (data:any) => console.log(data);
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
        <Input
          name="email"
          label='Enter your email address'
          placeholder='Enter your email address'
        />
        <Input
          name='password'
          label='Password'
          placeholder='Password'
        />
        <Button type="submit" className='w-full mt-6'>
          Login
        </Button>
    </form>
  )
}