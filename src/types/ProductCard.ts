import { IProduct } from './Products'

export type CardProps = Pick<
  IProduct,
  'id' | 'name' | 'price' | 'description' | 'productFileUrl'
>
