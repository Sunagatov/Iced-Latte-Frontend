import FiledProfile from './_components/FilledProfile/FiledProfile'
import PrivatRoute from '@/Context/PrivateRoute'

const ProfilePage = () => {
  return (
    <PrivatRoute>
      <FiledProfile />
    </PrivatRoute>
  )
}

export default ProfilePage
