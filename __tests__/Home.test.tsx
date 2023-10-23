import { render } from '@testing-library/react'
import Home from '@/app/page'

it('Should pass', () => {
  render(<Home />)
  expect(1).toBe(1)
})
