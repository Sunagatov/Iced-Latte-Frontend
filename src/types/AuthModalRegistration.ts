import { RootLayoutProps } from '@/app/layout'

export type AuthModalProps = {
  onCloseModal?: () => void
}

export type CombinedProps = AuthModalProps & RootLayoutProps
