import React from 'react'
import { useForm } from "react-hook-form";

interface RegistrForm{
  firstName: string
  lastName: string
  email: string
  password: string
}

const RegistrSubmit = (data:RegistrForm) => {
  //fetch registr
  console.log(data)
}

interface Props {
  LoginVisibleChange: Function
}

export const Login = ({LoginVisibleChange}:Props) => {
  const {register,handleSubmit} = useForm()
  return <div className='w-full h-full right-0 top-0 fixed z-10'>
    <div className='absolute bg-white py-4 px-6 h-full right-0 top-0 w-1/3 z-10'>
      <p className='text-2xl text-bolder mb-4'>Welcome Back</p>
      <button className='bg-[#682EFF] text-white font-bold py-2 px-4 rounded-full w-full'>Login</button>
      <p className='w-fill h-px bg-gray-200 my-6'></p>
      <form className='flex flex-col gap-8' onSubmit={handleSubmit(RegistrSubmit)}>
        <div>
          <p className='text-xl text-bold mb-2'>First name</p>
          <input {...register("firstName")} required minLength={2} maxLength={30} className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-200' placeholder='First name'/>
        </div>
        <div>
          <p className='text-xl text-bold mb-2'>Last name</p>
          <input {...register("lastName")} required minLength={2} maxLength={30} className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-200' placeholder='Last name'/>
        </div>
        <div>
          <p className='text-xl text-bold mb-2'>Email address</p>
          <input type='email' {...register('email', {
              required: 'Email is required',
              pattern: {
                  value: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                  message: 'Please enter a valid email',
              },
             })} required  className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-200' placeholder='Email address'/>
        </div>
        <div>
          <p className='text-xl text-bold mb-2'>Password</p>
          <input {...register("password")} required minLength={4} max={12}  className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-200' placeholder='Password' type='password'/>
        </div>
      <button className='bg-[#682EFF] text-white font-bold py-2 px-4 rounded-full w-full'>Login</button>
      </form>
      <p className='text-gray-300 text-xs mt-2'>By registering for an account, you agree to our <a className='underline hover:text-blue-300' href="">Terms of Use.</a></p>
    </div>
    <button onClick={LoginVisibleChange} className='w-full h-full right-0 top-0 absolute pointer bg-gray-900 opacity-80 pointer'></button>
  </div>
}
