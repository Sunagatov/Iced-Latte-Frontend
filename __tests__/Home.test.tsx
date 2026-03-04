import { render } from '@testing-library/react'
import Home from '@/app/page'
import '@testing-library/jest-dom'

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

it('Should pass', async () => {
  const AwaitedHome = await Home()

  render(AwaitedHome)
  expect(1).toBe(1)
})
