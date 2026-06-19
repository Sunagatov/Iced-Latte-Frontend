import { render, screen, waitFor } from '@testing-library/react'
import { useAuthStore } from '@/features/auth/store'
import AddressPicker from './AddressPicker'
import { useAddressStore } from '../store'
import type { DeliveryAddress } from '../types'

const defaultAddress: DeliveryAddress = {
  id: 'addr-1',
  label: 'Home',
  line: '704, Cassia Point',
  city: 'London',
  postcode: 'E20 1HU',
  country: 'United Kingdom',
  isDefault: true,
}

beforeEach(() => {
  useAuthStore.setState({
    status: 'loading',
    userData: null,
    isLoggedIn: false,
  })
  useAddressStore.setState({
    addresses: [],
    loading: false,
    error: null,
  })
})

describe('AddressPicker', () => {
  it('keeps checkout in a loading state while auth bootstrap is pending', () => {
    const fetch = jest.fn(async () => {})
    const onModeChange = jest.fn()
    const onSelect = jest.fn()

    useAddressStore.setState({ fetch })

    render(
      <AddressPicker
        mode="loading"
        onModeChange={onModeChange}
        onSelect={onSelect}
        selected={null}
      />,
    )

    expect(screen.getByText('Loading saved addresses...')).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('switches to saved addresses after authenticated fetch resolves', async () => {
    const onModeChange = jest.fn()
    const onSelect = jest.fn()
    const fetch = jest.fn(async () => {
      useAddressStore.setState({
        addresses: [defaultAddress],
        loading: false,
        error: null,
      })
    })

    useAddressStore.setState({ fetch })
    useAuthStore.setState({
      status: 'authenticated',
      userData: null,
      isLoggedIn: true,
    })

    render(
      <AddressPicker
        mode="loading"
        onModeChange={onModeChange}
        onSelect={onSelect}
        selected={null}
      />,
    )

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1))
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Saved addresses' }),
      ).toBeInTheDocument(),
    )

    expect(onModeChange).toHaveBeenCalledWith('saved')
    expect(onSelect).toHaveBeenCalledWith(defaultAddress)
  })
})
