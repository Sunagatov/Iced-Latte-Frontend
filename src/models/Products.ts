export interface IProductsList {
  products: IProduct[] | null
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface IProduct {
  id: string
  name: string
  description: string
  price: number
  quantity: number
  active: boolean
  productFileUrl: string | null
}
