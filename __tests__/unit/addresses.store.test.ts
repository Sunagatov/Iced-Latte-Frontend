import { useAddressStore } from '@/features/addresses/store'
import * as api from '@/features/addresses/api'
import { DeliveryAddress } from '@/features/addresses/types'

jest.mock('@/features/addresses/api', () => ({
  getAddresses: jest.fn(),
  createAddress: jest.fn(),
  updateAddress: jest.fn(),
  deleteAddress: jest.fn(),
  setDefaultAddress: jest.fn(),
}))

const mockedApi = jest.mocked(api)

const addr = (id: string, isDefault = false): DeliveryAddress => ({
  id,
  isDefault,
  label: 'home',
  line: 's',
  city: 'c',
  country: 'uk',
  postcode: '1',
})

beforeEach(() => {
  useAddressStore.setState({ addresses: [], loading: false })
  jest.clearAllMocks()
})

describe('address store', () => {
  it('fetch loads addresses', async () => {
    mockedApi.getAddresses.mockResolvedValue([addr('a1')])
    await useAddressStore.getState().fetch()
    expect(useAddressStore.getState().addresses).toHaveLength(1)
    expect(useAddressStore.getState().loading).toBe(false)
  })

  it('add appends address', async () => {
    mockedApi.createAddress.mockResolvedValue(addr('a2'))
    await useAddressStore.getState().add({ label: 'home', line: 's', city: 'c', country: 'uk', postcode: '1' })
    expect(useAddressStore.getState().addresses).toHaveLength(1)
  })

  it('update replaces address', async () => {
    useAddressStore.setState({ addresses: [addr('a1')], loading: false })
    mockedApi.updateAddress.mockResolvedValue({ ...addr('a1'), city: 'London' })
    await useAddressStore.getState().update('a1', { label: 'home', line: 's', city: 'London', country: 'uk', postcode: '1' })
    expect(useAddressStore.getState().addresses[0].city).toBe('London')
  })

  it('remove deletes address', async () => {
    useAddressStore.setState({ addresses: [addr('a1')], loading: false })
    mockedApi.deleteAddress.mockResolvedValue(null as never)
    await useAddressStore.getState().remove('a1')
    expect(useAddressStore.getState().addresses).toHaveLength(0)
  })

  it('setDefault marks correct address', async () => {
    useAddressStore.setState({ addresses: [addr('a1'), addr('a2')], loading: false })
    mockedApi.setDefaultAddress.mockResolvedValue(null as never)
    await useAddressStore.getState().setDefault('a2')
    const addresses = useAddressStore.getState().addresses

    expect(addresses.find((a: DeliveryAddress) => a.id === 'a2')?.isDefault).toBe(true)
    expect(addresses.find((a: DeliveryAddress) => a.id === 'a1')?.isDefault).toBe(false)
  })
})
