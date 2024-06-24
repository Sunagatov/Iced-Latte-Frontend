import React from 'react'
import Image from 'next/image'
import google from '../../../../public/google.svg'

const GoogleAuthButton: React.FC = () => {
  const handleGoogleAuth = () => {
    // Implement Google authentication logic here
    console.log('Initiating Google authentication...')
  }

  return (
    <button
      aria-label="Sign in with Google"
      className="flex w-full items-center justify-start rounded-full border-2 border-black bg-white py-2"
      onClick={handleGoogleAuth}
    >
      <div className="ml-6 flex h-9 w-9 items-center justify-center rounded-full bg-white  ">
        <div className="flex h-[24px] w-[24px] items-center justify-center sm:h-[31px] sm:w-[28px]">
          <Image src={google} width={24} alt="google logo" priority />
        </div>
      </div>
      <span className="flex-grow font-bold tracking-wider text-secondary">
        Continue with Google
      </span>
    </button>
  )
}

export default GoogleAuthButton
