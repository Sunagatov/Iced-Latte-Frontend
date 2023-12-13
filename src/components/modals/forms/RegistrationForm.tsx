import Button from '@/components/ui/Button'
import FormInput from '@/components/ui/FormInput'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { SubmitHandler, useForm } from 'react-hook-form'

interface IFormValues {
  firstName: string
  lastName: string
  email: string
  password: string
}

const schema = yup.object().shape({
  firstName: yup.string().required('First name is a required field'),
  lastName: yup.string().required('Last name is a required field'),
  email: yup.string().required('Email is a required field'),
  password: yup.string().required('Password is a required field'),
})

export default function RegistrationForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  })

  const onSubmit: SubmitHandler<IFormValues> = (data) => console.log(data)

  return (
    <form onSubmit={() => handleSubmit(onSubmit)} className="flex flex-col">
      <FormInput
        id="firstName"
        register={register}
        name="firstName"
        type="text"
        label="First name"
        placeholder="First name"
        error={errors.firstName}
      />
      <FormInput
        id="lastName"
        register={register}
        name="lastName"
        type="text"
        label="Last name"
        placeholder="Last name"
        error={errors.lastName}
      />
      <FormInput
        id="email"
        register={register}
        name="email"
        type="text"
        label="Email address"
        placeholder="Email address"
        error={errors.email}
      />
      <FormInput
        id="password"
        register={register}
        name="password"
        type="password"
        label="Password"
        placeholder="Password"
        error={errors.password}
      />
      <Button type="submit" className="mt-6 w-full hover:bg-brand-solid-hover">
        Register
      </Button>
    </form>
  )
}
