import type {
  BrandsDto,
  ProductInfoDto,
  ProductListWithPaginationInfoDto,
  SellersDto,
} from '@/shared/api/generated/product'

export type IProductsList = Omit<
  ProductListWithPaginationInfoDto,
  'products'
> & {
  products: IProduct[] | null
}

export interface IProduct
  extends Omit<
    ProductInfoDto,
    | 'aiSummary'
    | 'dateAdded'
    | 'discount'
    | 'height'
    | 'length'
    | 'originCountry'
    | 'popularityScore'
    | 'productFileUrl'
    | 'soldProductsCount'
    | 'weight'
    | 'width'
  > {
  productFileUrl?: string | null
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

export type IGetProductSellers = SellersDto

export type IGetProductBrands = BrandsDto
