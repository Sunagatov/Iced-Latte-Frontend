import { defineConfig, defineTransformer } from 'orval'
import type { OpenApiDocument } from '@orval/core'

const backendSpecsDir = '../Iced-Latte/src/main/resources/api-specs'
const generatedDir = './src/shared/api/generated'
const mutator = {
  path: './src/shared/api/orvalMutator.ts',
  name: 'orvalMutator',
}

const frontendExcludedPathsBySpec: Record<string, string[]> = {
  order: [
    '/api/v1/admin/orders',
    '/api/v1/admin/orders/{orderId}/status',
  ],
  payment: [
    '/api/v1/payment/stripe/webhook',
  ],
}

const frontendExcludedSchemasBySpec: Record<string, (string | RegExp)[]> = {
  order: [
    'AdminOrderStatusUpdateDto',
    'UploadUserAvatarRequest',
    'UpdateUserAccountRequest',
    'PasswordField',
    'ChangeUserPasswordRequest',
    'UserDto',
    'InitiatePasswordResetRequest',
    'ConfirmPasswordResetRequest',
    'DeliveryAddressDto',
    'DeliveryAddressRequest',
  ],
  payment: [
    'UploadUserAvatarRequest',
    'UpdateUserAccountRequest',
    'PasswordField',
    'ChangeUserPasswordRequest',
    'UserDto',
    'InitiatePasswordResetRequest',
    'ConfirmPasswordResetRequest',
    'DeliveryAddressDto',
    'DeliveryAddressRequest',
    'OrderEvent',
    'CreateNewOrderRequestDto',
    'OrderItemDto',
    'OrderDto',
    'OrderSummaryDto',
    'OrderPageDto',
    'RefundRequestDto',
    'UnavailableItemDto',
    'ReorderResponseDto',
    'AdminOrderStatusUpdateDto',
    'OrderStatusHistoryDto',
  ],
  security: [
    'UploadUserAvatarRequest',
    'UpdateUserAccountRequest',
    'PasswordFieldD2fd7b5',
    'ChangeUserPasswordRequest',
    'UserDto',
    'InitiatePasswordResetRequest',
    'ConfirmPasswordResetRequest',
    'DeliveryAddressDto',
    'DeliveryAddressRequest',
  ],
}

const stripFrontendExcludedPaths = (specName: string) =>
  defineTransformer((spec: OpenApiDocument): OpenApiDocument => {
    const excludedPaths = frontendExcludedPathsBySpec[specName]

    if (!excludedPaths?.length) {
      return spec
    }

    const paths = { ...spec.paths }

    for (const path of excludedPaths) {
      delete paths[path]
    }

    return {
      ...spec,
      paths,
    }
  })

const makeApi = (specName: string, outputName: string) => ({
  input: {
    target: `${backendSpecsDir}/${specName}-openapi.yaml`,
    filters: {
      mode: 'exclude' as const,
      schemas: frontendExcludedSchemasBySpec[outputName],
    },
    override: {
      transformer: stripFrontendExcludedPaths(outputName),
    },
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
  supportChat: makeApi('support-chat', 'supportChat'),
  user: makeApi('user', 'user'),
})
