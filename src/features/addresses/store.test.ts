import { useAddressStore } from '@/features/addresses/store'
import * as api from '@/features/addresses/api'
import type { DeliveryAddress } from '@/features/addresses/types'

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
  useAddressStore.setState({ addresses: [], loading: false, error: null })
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
    await useAddressStore.getState().add({
      label: 'home',
      line: 's',
      city: 'c',
      country: 'uk',
      postcode: '1',
    })
    expect(useAddressStore.getState().addresses).toHaveLength(1)
  })

  it('add rejects and keeps existing addresses when the API fails', async () => {
    const error = new Error('network down')

    useAddressStore.setState({ addresses: [addr('a1')], loading: false })
    mockedApi.createAddress.mockRejectedValue(error)

    await expect(useAddressStore.getState().add({
      label: 'home',
      line: 's',
      city: 'c',
      country: 'uk',
      postcode: '1',
    })).rejects.toBe(error)

    expect(useAddressStore.getState().addresses).toEqual([addr('a1')])
    expect(useAddressStore.getState().error).toBeTruthy()
  })

  it('update replaces address', async () => {
    useAddressStore.setState({ addresses: [addr('a1')], loading: false })
    mockedApi.updateAddress.mockResolvedValue({ ...addr('a1'), city: 'London' })
    await useAddressStore.getState().update('a1', {
      label: 'home',
      line: 's',
      city: 'London',
      country: 'uk',
      postcode: '1',
    })
    expect(useAddressStore.getState().addresses[0].city).toBe('London')
  })

  it('update rejects and keeps the previous address when the API fails', async () => {
    const error = new Error('update failed')

    useAddressStore.setState({ addresses: [addr('a1')], loading: false })
    mockedApi.updateAddress.mockRejectedValue(error)

    await expect(useAddressStore.getState().update('a1', {
      label: 'home',
      line: 's',
      city: 'London',
      country: 'uk',
      postcode: '1',
    })).rejects.toBe(error)

    expect(useAddressStore.getState().addresses[0]).toEqual(addr('a1'))
    expect(useAddressStore.getState().error).toBeTruthy()
  })

  it('remove deletes address', async () => {
    useAddressStore.setState({ addresses: [addr('a1')], loading: false })
    mockedApi.deleteAddress.mockResolvedValue(null as never)
    await useAddressStore.getState().remove('a1')
    expect(useAddressStore.getState().addresses).toHaveLength(0)
  })

  it('remove rejects and keeps the address when the API fails', async () => {
    const error = new Error('delete failed')

    useAddressStore.setState({ addresses: [addr('a1')], loading: false })
    mockedApi.deleteAddress.mockRejectedValue(error)

    await expect(useAddressStore.getState().remove('a1')).rejects.toBe(error)

    expect(useAddressStore.getState().addresses).toEqual([addr('a1')])
    expect(useAddressStore.getState().error).toBeTruthy()
  })

  it('setDefault marks correct address', async () => {
    useAddressStore.setState({
      addresses: [addr('a1'), addr('a2')],
      loading: false,
    })
    mockedApi.setDefaultAddress.mockResolvedValue(null as never)
    await useAddressStore.getState().setDefault('a2')
    const addresses = useAddressStore.getState().addresses

    expect(
      addresses.find((a: DeliveryAddress) => a.id === 'a2')?.isDefault,
    ).toBe(true)
    expect(
      addresses.find((a: DeliveryAddress) => a.id === 'a1')?.isDefault,
    ).toBe(false)
  })

  it('setDefault rejects and keeps defaults unchanged when the API fails', async () => {
    const error = new Error('default failed')

    useAddressStore.setState({
      addresses: [addr('a1', true), addr('a2')],
      loading: false,
    })
    mockedApi.setDefaultAddress.mockRejectedValue(error)

    await expect(useAddressStore.getState().setDefault('a2')).rejects.toBe(error)

    const addresses = useAddressStore.getState().addresses

    expect(addresses.find((a: DeliveryAddress) => a.id === 'a1')?.isDefault).toBe(true)
    expect(addresses.find((a: DeliveryAddress) => a.id === 'a2')?.isDefault).toBe(false)
    expect(useAddressStore.getState().error).toBeTruthy()
  })
})
