import { ProfileListProps } from '@/types/ProfileListItem'

const ProfileListItem = ({ label, data }: ProfileListProps) => {
  return (
    <li className="flex">
      <span className="w-[152px] text-primary opacity-60">{label}:</span>
      {data ?? 'N/A'}
    </li>
  )
}

export default ProfileListItem
