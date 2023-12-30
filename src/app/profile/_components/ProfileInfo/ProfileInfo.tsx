import { UserData } from '@/services/userService'
import { formatDate } from '@/utils/formDate'
import ProfileListItem from '@/components/ui/ProfileListItem'
import Button from '@/components/ui/Button'
import Loader from '@/components/ui/Loader'

type UserProfileInfoProps = {
  userData: UserData | null
  onEditClick: () => void
  isLoading: boolean
}

const ProfileInfo = ({
  userData,
  onEditClick,
  isLoading,
}: UserProfileInfoProps) => {
  return (
    <>
      {isLoading && <Loader />}
      {userData && (
        <div>
          <h2 className="mb-8 text-2xl font-medium text-primary">
            Personal details
          </h2>
          <ul className="mb-10 flex flex-col gap-y-6">
            <ProfileListItem label="First name" data={userData.firstName} />
            <ProfileListItem label="Last name" data={userData.lastName} />
            <ProfileListItem
              label="Date of birth"
              data={userData.birthDate ? formatDate(userData.birthDate) : null}
            />
            <ProfileListItem label="Email" data={userData.email} />
            <ProfileListItem label="Phone number" data={userData.phoneNumber} />
          </ul>

          <div>
            <h3 className="mb-8 text-2xl font-medium text-primary">
              Delivery address
            </h3>
            <ul className="mb-10 flex flex-col gap-y-6">
              <ProfileListItem
                label="Country"
                data={userData.address?.country}
              />
              <ProfileListItem label="City" data={userData.address?.city} />
              <ProfileListItem label="Address" data={userData.address?.line} />
              <ProfileListItem
                label="Postcode"
                data={userData.address?.postcode}
              />
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
