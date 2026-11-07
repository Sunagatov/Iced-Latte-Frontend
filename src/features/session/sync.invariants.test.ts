import { useAuthStore } from '@/features/auth/store'
import { useCartStore } from '@/features/cart/cartStore'
import { acceptSnapshot, confirmedSnapshot } from './resourceState'
import { keepProfileEdits } from '@/features/user/profileConflict'

const owner = '00000000-0000-4000-8000-000000000001'
const product = '418499f3-d951-40bf-9414-5cb90ab21ecb'

function permutations(values: number[]): number[][] {
  return values.length
    ? values.flatMap((value, index) =>
      permutations(values.filter((_, i) => i !== index)).map((rest) => [
        value,
        ...rest,
      ]),
    )
    : [[]]
}
const orders = permutations([0, 1, 2, 3])

test.each(orders.map((order) => [order.join(','), order] as const))(
  'snapshot order %s never moves confirmed data backwards',
  (_name, order) => {
    useAuthStore.getState().reset()
    useAuthStore
      .getState()
      .setAuthenticated({ id: owner, email: 'test@example.invalid' } as never)
    useCartStore.getState().resetCart()
    let highest = -1

    for (const revision of order) {
      acceptSnapshot('cart', {
        userId: owner,
        revision,
        data: {
          items: [
            {
              id: 'slot',
              productInfo: { id: product, name: 'Test', price: 10 },
              productQuantity: revision + 1,
            },
          ],
        },
      })
      highest = Math.max(highest, revision)
      expect(confirmedSnapshot('cart', owner)?.revision).toBe(highest)
      expect(useCartStore.getState().count).toBe(highest + 1)
    }
    expect(useCartStore.getState().count).toBe(4)
  },
)

test('late snapshots belonging to another UUID do not reach the current account', () => {
  useAuthStore
    .getState()
    .setAuthenticated({ id: owner, email: 'same@example.invalid' } as never)
  useCartStore.getState().resetCart()
  useAuthStore.getState().setAuthenticated({
    id: 'another-uuid',
    email: 'same@example.invalid',
  } as never)
  acceptSnapshot('cart', {
    userId: owner,
    revision: 100,
    data: {
      items: [
        {
          id: 'old',
          productInfo: { id: product, price: 10 },
          productQuantity: 99,
        },
      ],
    },
  })
  expect(useCartStore.getState().count).toBe(0)
})

test('reviewing a profile conflict preserves untouched remote fields and explicit local clears', () => {
  const base = {
    firstName: 'Original',
    lastName: 'Person',
    email: 'test@example.invalid',
    phoneNumber: '+442071234567',
    address: { city: 'London', country: 'UK' },
    profileRevision: 1,
  }
  const draft = {
    ...base,
    firstName: 'Local',
    phoneNumber: null,
    address: { ...base.address, city: 'York' },
  }
  const latest = {
    ...base,
    lastName: 'Remote',
    address: { ...base.address, country: 'France' },
    profileRevision: 2,
  }

  expect(keepProfileEdits(base, draft, latest)).toEqual({
    ...latest,
    firstName: 'Local',
    phoneNumber: null,
    address: { city: 'York', country: 'France' },
  })
})
