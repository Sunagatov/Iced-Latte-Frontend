import { render } from '@testing-library/react'
import Home from '@/app/page'
import '@testing-library/jest-dom'

it('Should pass', async () => {
  const AwaitedHome = await Home()

  render(AwaitedHome)
  expect(1).toBe(1)
})
