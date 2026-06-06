import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import AddressForm from '@/features/addresses/components/AddressForm'
import { useAddressStore } from '@/features/addresses/store'

jest.mock('@/features/addresses/store', () => ({
  useAddressStore: jest.fn(),
}))

const mockedUseAddressStore = jest.mocked(useAddressStore)
const add = jest.fn()
const update = jest.fn()

function renderAddressForm(onClose = jest.fn()) {
  mockedUseAddressStore.mockReturnValue({ add, update })

  render(<AddressForm onClose={onClose} />)

  return { onClose }
}

function fillAddressForm() {
  fireEvent.change(screen.getByLabelText('Label (e.g. Home, Work)'), {
    target: { value: 'Home' },
  })
  fireEvent.change(screen.getByLabelText('Address line'), {
    target: { value: '1 Main St' },
  })
  fireEvent.change(screen.getByLabelText('City'), {
    target: { value: 'London' },
  })
  fireEvent.change(screen.getByLabelText('Postcode'), {
    target: { value: 'SW1A 1AA' },
  })
  fireEvent.change(screen.getByLabelText('Country'), {
    target: { value: 'United Kingdom' },
  })
}

describe('AddressForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    add.mockResolvedValue(undefined)
    update.mockResolvedValue(undefined)
  })

  it('exposes the address form as a dialog', () => {
    renderAddressForm()

    expect(screen.getByRole('dialog', { name: 'Add new address' })).toHaveAttribute(
      'aria-modal',
      'true',
    )
  })

  it('keeps the form open when creating an address fails', async () => {
    const onClose = jest.fn()
    const error = new Error('create failed')

    add.mockRejectedValue(error)
    renderAddressForm(onClose)
    fillAddressForm()

    fireEvent.click(screen.getByRole('button', { name: 'Add address' }))

    await waitFor(() => {
      expect(add).toHaveBeenCalledWith({
        city: 'London',
        country: 'United Kingdom',
        label: 'Home',
        line: '1 Main St',
        postcode: 'SW1A 1AA',
      })
    })
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog', { name: 'Add new address' })).toBeInTheDocument()
  })

  it('closes the form after a successful create', async () => {
    const onClose = jest.fn()

    renderAddressForm(onClose)
    fillAddressForm()

    fireEvent.click(screen.getByRole('button', { name: 'Add address' }))

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })
})
