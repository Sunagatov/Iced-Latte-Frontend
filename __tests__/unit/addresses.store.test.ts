import { useAddressStore } from '@/features/addresses/store'

jest.mock('src/features/addresses/api', () => ({
  getAddresses: jest.fn(),
  createAddress: jest.fn(),
  updateAddress: jest.fn(),
  deleteAddress: jest.fn(),
  setDefaultAddress: jest.fn(),
}))

const api = require('src/features/addresses/api')

const addr = (id: string, isDefault = false) => ({
  id,
  isDefault,
  street: 's',
  city: 'c',
  country: 'uk',
  postcode: '1',
  phoneNumber: '0',
})

beforeEach(() => {
  useAddressStore.setState({ addresses: [], loading: false })
  jest.clearAllMocks()
})

describe('address store', () => {
  it('fetch loads addresses', async () => {
    api.getAddresses.mockResolvedValue([addr('a1')])
    await useAddressStore.getState().fetch()
    expect(useAddressStore.getState().addresses).toHaveLength(1)
    expect(useAddressStore.getState().loading).toBe(false)
  })

  it('add appends address', async () => {
    api.createAddress.mockResolvedValue(addr('a2'))
    await useAddressStore.getState().add({ street: 's', city: 'c', country: 'uk', postcode: '1', phoneNumber: '0' })
    expect(useAddressStore.getState().addresses).toHaveLength(1)
  })

  it('update replaces address', async () => {
    useAddressStore.setState({ addresses: [addr('a1')], loading: false })
    api.updateAddress.mockResolvedValue({ ...addr('a1'), city: 'London' })
    await useAddressStore.getState().update('a1', { street: 's', city: 'London', country: 'uk', postcode: '1', phoneNumber: '0' })
    expect(useAddressStore.getState().addresses[0].city).toBe('London')
  })

  it('remove deletes address', async () => {
    useAddressStore.setState({ addresses: [addr('a1')], loading: false })
    api.deleteAddress.mockResolvedValue(undefined)
    await useAddressStore.getState().remove('a1')
    expect(useAddressStore.getState().addresses).toHaveLength(0)
  })

  it('setDefault marks correct address', async () => {
    useAddressStore.setState({ addresses: [addr('a1'), addr('a2')], loading: false })
    api.setDefaultAddress.mockResolvedValue(undefined)
    await useAddressStore.getState().setDefault('a2')
    const addresses = useAddressStore.getState().addresses
    expect(addresses.find((a) => a.id === 'a2')?.isDefault).toBe(true)
    expect(addresses.find((a) => a.id === 'a1')?.isDefault).toBe(false)
  })
})
