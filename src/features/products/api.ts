import {
  IGetProductBrands,
  IGetProductSellers,
  IProduct,
  IProductsList,
} from './types'
import {
  getAllBrands,
  getAllSellers,
  getProductById,
  getProducts,
  getProductsByIds,
  type GetProductsParams,
} from '@/shared/api/generated/product'

function getProductParamsFromPath(url: string): GetProductsParams {
  const [, queryString = ''] = url.split('?')
  const params = new URLSearchParams(queryString)
  const getNumber = (name: string) => {
    const value = params.get(name)

    return value ? Number(value) : undefined
  }
  const getArray = (name: string) => {
    const value = params.get(name)

    return value ? value.split(',').filter(Boolean) : undefined
  }

  return {
    page: getNumber('page'),
    size: getNumber('size'),
    sort_attribute: params.get('sort_attribute') as GetProductsParams['sort_attribute'],
    sort_direction: params.get('sort_direction') as GetProductsParams['sort_direction'],
    min_price: getNumber('min_price'),
    max_price: getNumber('max_price'),
    minimum_average_rating: getNumber('minimum_average_rating'),
    brand_names: getArray('brand_names'),
    seller_names: getArray('seller_names'),
    keyword: params.get('keyword') ?? undefined,
  }
}

export async function getAllProducts(url: string) {
  return getProducts(getProductParamsFromPath(url)) as Promise<IProductsList>
}

export async function getProduct(id: string) {
  return getProductById(id) as Promise<IProduct>
}

export async function getProductByIds(ids: string[]) {
  return getProductsByIds({ productIds: ids }) as Promise<IProduct[]>
}

export const getProductSellers = async (): Promise<IGetProductSellers> => {
  return getAllSellers() as Promise<IGetProductSellers>
}

export const getProductBrands = async (): Promise<IGetProductBrands> => {
  return getAllBrands() as Promise<IGetProductBrands>
}
