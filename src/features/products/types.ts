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
  productImageUrls?: string[]
  averageRating: number
  reviewsCount: number
  brandName: string
  sellerName: string
  aiSummary?: string | null
  originCountry?: string | null
  weight?: number | null
  length?: number | null
  width?: number | null
  height?: number | null
  soldProductsCount?: number | null
  discount?: number | null
  dateAdded?: string | null
  popularityScore?: number | null
}

export interface IGetProductSellers {
  sellers: string[]
}

export interface IGetProductBrands {
  brands: string[]
}
