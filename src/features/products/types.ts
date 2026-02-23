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
  averageRating: number
  reviewsCount: number
  brandName: string
  sellerName: string
}

export interface IGetProductSellers {
  sellers: string[]
}

export interface IGetProductBrands {
  brands: string[]
}
