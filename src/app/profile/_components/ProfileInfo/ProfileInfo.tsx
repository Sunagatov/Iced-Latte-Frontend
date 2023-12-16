import { UserData } from '@/services/userService'
import Button from '@/components/ui/Button'

type UserProfileInfoProps = {
  userData: UserData | null
  formatDate: (dateString: string | null) => string
  onEditClick: () => void
  isLoading: boolean
}

const ProfileInfo = ({
  userData,
  formatDate,
  onEditClick,
  isLoading,
}: UserProfileInfoProps) => {
  return (
    <>
      {isLoading && <div className="text-center">Loading...</div>}
      {userData && (
        <div>
          <h2 className="mb-8 text-2xl font-medium text-primary">
            Personal details
          </h2>
          <ul className="mb-10 flex flex-col gap-y-6">
            <li className="flex">
              <span className="w-[152px] text-primary opacity-60">
                First name:
              </span>
              {userData.firstName}
            </li>
            <li className="flex">
              <span className="w-[152px] text-primary opacity-60">
                Last name:
              </span>
              {userData.lastName}
            </li>
            <li className="flex">
              <span className="w-[152px] text-primary opacity-60">
                Date of birth:
              </span>
              {userData.birthDate ? formatDate(userData.birthDate) : 'N/A'}
            </li>
            <li className="flex">
              <span className="w-[152px] text-primary opacity-60">Email:</span>
              {userData.email}
            </li>
            <li className="flex">
              <span className="w-[152px] text-primary opacity-60">
                Phone number:
              </span>
              {userData.phoneNumber || 'N/A'}
            </li>
          </ul>

          <div>
            <h3 className="mb-8 text-2xl font-medium text-primary">
              Delivery address
            </h3>
            <ul className="mb-10 flex flex-col gap-y-6">
              <li className="flex">
                <span className="w-[152px] text-primary opacity-60">
                  Country:
                </span>
                {userData.address?.country || 'N/A'}
              </li>
              <li className="flex">
                <span className="w-[152px] text-primary opacity-60">City:</span>
                {userData.address?.city || 'N/A'}
              </li>
              <li className="flex">
                <span className="w-[152px] text-primary opacity-60">
                  Address:
                </span>
                {userData.address?.line || 'N/A'}
              </li>
              <li className="flex">
                <span className="secondary w-[152px] text-primary opacity-60">
                  Postcode:
                </span>
                {userData.address?.postcode || 'N/A'}
              </li>
            </ul>
            <Button
              onClick={onEditClick}
              className="mb-[32px] flex w-[130px] cursor-pointer items-center justify-center rounded-[47px] bg-brand-solid px-6 py-4 text-lg font-medium text-white transition-opacity  hover:opacity-60"
            >
              <span>Edit</span>
            </Button>
          </div>
        </div>
      )}
    </>
  )
}

export default ProfileInfo
