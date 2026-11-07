import { mergeCarts, removeCartItem, changeCartItemQuantity } from './cartApi'
import { executeCommand } from '@/features/session/syncCommands'

jest.mock('@/features/session/syncCommands', () => ({
  executeCommand: jest.fn(),
  readConfirmed: jest.fn(),
}))

test('guest merge preserves its operation ID, while ordinary adds create separate commands', async () => {
  const payload = { items: [{ productId: 'product', productQuantity: 2 }] }

  await mergeCarts(payload, undefined, 'merge-key')
  expect(executeCommand).toHaveBeenLastCalledWith('cart', 'merge', payload, {
    operationId: 'merge-key',
  })
  await mergeCarts(payload)
  expect(executeCommand).toHaveBeenLastCalledWith('cart', 'add', payload, {
    operationId: undefined,
  })
})

test('clear targets products even when the slot of an uncertain add is unknown', async () => {
  await removeCartItem([], ['product'])
  expect(executeCommand).toHaveBeenLastCalledWith('cart', 'clear', {
    productIds: ['product'],
  })
})

test('quantity adjustment is bound to a product rather than a stale slot', async () => {
  await changeCartItemQuantity({
    productId: 'product',
    shoppingCartItemId: 'old-slot',
    productQuantityChange: 1,
  })
  expect(executeCommand).toHaveBeenLastCalledWith('cart', 'adjust', {
    productId: 'product',
    quantity: 1,
  })
})
