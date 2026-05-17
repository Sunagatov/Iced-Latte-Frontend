export {
  getAllProducts,
  getProduct,
  getProductBrands,
  getProductByIds,
  getProductSellers,
} from '@/features/products/api'
export { default as ProductCatalog } from '@/features/products/components/ProductCatalog/ProductCatalog'
export { default as SearchBar } from '@/features/products/components/search/SearchBar'
export type {
  IGetProductBrands,
  IGetProductSellers,
  IProduct,
  IProductsList,
} from '@/features/products/types'
