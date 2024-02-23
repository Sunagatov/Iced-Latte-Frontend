'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/UI/Buttons/Button/Button'
import FormInput from '@/components/UI/FormInput/FormInput'
import { apiForgotPassword } from '@/services/authService'

export default function ForgotPassForm() {
  const { handleSubmit, register, getValues, reset } = useForm()
  const [emailSent, setEmailSent] = useState(false)

  const router = useRouter()

  const handleButtonClick = () => {
    router.push('/resetpass')
  }

  const onSubmit = async () => {
    const { email } = getValues() as { email: string }

    console.log(email)

    try {
      await apiForgotPassword({ email })
      setEmailSent(true)
      localStorage.setItem('emailForReset', email)
      reset()
    } catch (error) {
      console.error('Error sending confirmation email:', error)
    }
  }

  const handleChangeClick = () => {
    router.push('/resetpass')
  }

  return (
    <div className="mx-auto mt-4 flex  max-w-screen-md items-center justify-center px-4">
      {emailSent ? (
        <div>
          <h2 className="mb-4 pt-6 text-4xl font-medium text-slate-950">
            Email is on the way!
          </h2>
          <div>
            <p className="mb-10 text-lg font-medium text-slate-950">
              We sent you password reset instructions. If it doesn`t show up
              soon, check your spam folder. We sent it from the email address
              no-reply@abc.com
            </p>
            <Button onClick={handleButtonClick}>Return to main page</Button>
            <Button onClick={handleChangeClick}>Chnage your password</Button>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="mb-4 pt-6 text-4xl font-medium text-slate-950">
            Forgot password?
          </h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <p className="mb-8 text-lg font-medium text-slate-950">
              All good. Enter your account`s email address and we`ll send you a
              link to reset your password.
            </p>

            <FormInput
              id="email"
              register={register}
              name="email"
              label="Enter your email"
              type="email"
              placeholder="Enter your email address"
              className="mb-5"
            />

            <Button type="submit" className="px-6">
              Send reset link
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}




// 'use client'

// import React from 'react'
// import { useForm } from 'react-hook-form'
// import { useState } from 'react'
// import { useRouter } from 'next/navigation'
// import Button from '@/components/UI/Buttons/Button/Button'
// import FormInput from '@/components/UI/FormInput/FormInput'
// import { apiForgotPassword } from '@/services/authService'

// export default function ForgotPassForm() {
//   const { handleSubmit, register, getValues, reset } = useForm()
//   const [emailSent, setEmailSent] = useState(false)

//   const router = useRouter()

//   const handleButtonClick = () => {
//     router.push('/resetpass')
//   }

//   const onSubmit = async () => {
//     const { email } = getValues() as { email: string }

//     try {
//       await apiForgotPassword({ email })

//       setEmailSent(true)
//       localStorage.setItem('emailForReset', email)
//       reset()
//     } catch (error) {
//       console.error('Error sending confirmation email:', error)
//     }
//   }

//   const handleChangeClick = () => {
//     router.push('/resetpass')
//   }

//   return (
//     <div className="mx-auto mt-4 flex  max-w-screen-md items-center justify-center px-4">
//       {emailSent ? (
//         <div>
//           <h2 className="mb-4 pt-6 text-4xl font-medium text-slate-950">
//             Email is on the way!
//           </h2>
//           <div>
//             <p className="mb-10 text-lg font-medium text-slate-950">
//               We sent you password reset instructions. If it doesn`t show up
//               soon, check your spam folder. We sent it from the email address
//               no-reply@abc.com
//             </p>
//             <Button onClick={handleButtonClick}>Return to main page</Button>
//             <Button onClick={handleChangeClick}>Chnage your password</Button>
//           </div>
//         </div>
//       ) : (
//         <div>
//           <h2 className="mb-4 pt-6 text-4xl font-medium text-slate-950">
//             Forgot password?
//           </h2>
//           <form onSubmit={handleSubmit(onSubmit)}>
//             <p className="mb-8 text-lg font-medium text-slate-950">
//               All good. Enter your account`s email address and we`ll send you a
//               link to reset your password.
//             </p>

//             <FormInput
//               id="email"
//               register={register}
//               name="email"
//               label="Enter your email"
//               type="email"
//               placeholder="Enter your email address"
//               className="mb-5"
//             />

//             <Button type="submit" className="px-6">
//               Send reset link
//             </Button>
//           </form>
//         </div>
//       )}
//     </div>
//   )
// }





