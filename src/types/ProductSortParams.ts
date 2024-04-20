import { sortOptions } from '@/constants/productSortOptions'


export type ProductSortLabel = typeof sortOptions[number]['label'];
export type ProductSortValue = typeof sortOptions[number]['value'];