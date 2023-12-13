'use client'

import Button from '@/components/ui/Button'
import FormInput from '@/components/ui/FormInput'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { SubmitHandler, useForm } from 'react-hook-form'

interface IFormValues {
  email: string
  password: string
}

const schema = yup.object().shape({
  email: yup.string().required('Email is a required field'),
  password: yup.string().required('Password is a required field'),
})

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  })
  const onSubmit: SubmitHandler<IFormValues> = (data) => console.log(data)

  return (
    <form onSubmit={() => handleSubmit(onSubmit)} className="flex flex-col">
      <FormInput
        id="email"
        register={register}
        name="email"
        type="text"
        label="Enter your email address"
        placeholder="Enter your email address"
        error={errors.email}
      />
      <FormInput
        id="password"
        register={register}
        type="password"
        name="password"
        label="Password"
        placeholder="Password"
        error={errors.password}
      />
      <Button type="submit" className="mt-6 w-full hover:bg-brand-solid-hover">
        Login
      </Button>
    </form>
  )
}
