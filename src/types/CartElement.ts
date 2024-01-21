import { ICartItem } from './Cart'

export interface CartElementProps {
  product: ICartItem
  add: () => void
  remove: () => void
  removeAll: () => void
}
