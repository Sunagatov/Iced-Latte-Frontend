import { buildProfileSummary } from '@/features/user/components/profile/profileSummary'
import { DEFAULT_AVATAR_LINK } from '@/features/user/constants'
import type { UserData } from '@/features/user/public'

describe('buildProfileSummary', () => {
  it('builds display values from user data', () => {
    const userData: UserData = {
      firstName: 'Ada',
      lastName: 'Lovelace',
      birthDate: '1815-12-10',
      phoneNumber: '+12025550123',
      email: 'ada@example.com',
      avatarLink: 'https://cdn.example.com/avatar.png',
      address: {
        city: 'London',
      },
    }

    expect(buildProfileSummary(userData)).toMatchObject({
      city: 'London',
      fullName: 'Ada Lovelace',
      hasCustomAvatar: true,
      initials: 'AL',
    })
  })

  it('treats the backend default avatar sentinel as no custom avatar', () => {
    const userData: UserData = {
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      avatarLink: DEFAULT_AVATAR_LINK,
      address: {},
    }

    expect(buildProfileSummary(userData).hasCustomAvatar).toBe(false)
  })
})
