import { defineConfig } from 'orval'

const backendSpecsDir = '../Iced-Latte/src/main/resources/api-specs'
const generatedDir = './src/shared/api/generated'
const mutator = {
  path: './src/shared/api/orvalMutator.ts',
  name: 'orvalMutator',
}

const makeApi = (specName: string, outputName: string) => ({
  input: {
    target: `${backendSpecsDir}/${specName}-openapi.yaml`,
  },
  output: {
    target: `${generatedDir}/${outputName}.ts`,
    client: 'axios-functions' as const,
    headers: true,
    prettier: true,
    override: {
      mutator,
    },
  },
})

export default defineConfig({
  cart: makeApi('cart', 'cart'),
  favorite: makeApi('favorite', 'favorite'),
  order: makeApi('order', 'order'),
  payment: makeApi('payment', 'payment'),
  product: makeApi('product', 'product'),
  productReview: makeApi('product-review', 'productReview'),
  security: makeApi('security', 'security'),
  user: makeApi('user', 'user'),
})
