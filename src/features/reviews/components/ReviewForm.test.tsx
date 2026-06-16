import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import ReviewForm from '@/features/reviews/components/ReviewForm'
import { apiAddProductReview } from '@/features/reviews/api'
import { useAuthStore } from '@/features/auth/public'
import { useProductRatingStore } from '@/features/reviews/store'
import type { ForwardedRef } from 'react'

let mockReviewsTurnstileEnabled = false

jest.mock('@/features/reviews/api', () => ({
  apiAddProductReview: jest.fn(),
}))

jest.mock('@/features/reviews/config', () => ({
  // noinspection JSUnusedGlobalSymbols -- the component imports this mocked getter by name.
  get reviewsTurnstileEnabled() {
    return mockReviewsTurnstileEnabled
  },
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

jest.mock('@/shared/ui/TurnstileWidget', () => {
  const React = jest.requireActual('react')
  const MockTurnstileWidget = React.forwardRef(
    (
      { onVerify }: { onVerify: (token: string) => void },
      ref: ForwardedRef<{ reset: () => void }>,
    ) => {
      React.useImperativeHandle(ref, () => ({ reset: jest.fn() }))

      return (
        <button type="button" onClick={() => onVerify('turnstile-token')}>
          Verify challenge
        </button>
      )
    },
  )

  MockTurnstileWidget.displayName = 'MockTurnstileWidget'

  return {
    __esModule: true,
    default: MockTurnstileWidget,
  }
})

const mockedApiAddProductReview = jest.mocked(apiAddProductReview)

function renderReviewForm() {
  return render(
    <ReviewForm
      productId="p1"
      showForm
      setShowForm={jest.fn()}
      onReviewSubmitted={jest.fn()}
    />,
  )
}

describe('ReviewForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockReviewsTurnstileEnabled = false
    useAuthStore.setState({ status: 'authenticated', isLoggedIn: true })
    useProductRatingStore.setState({
      ratings: { p1: { id: 'p1', rating: 5 } },
    })
  })

  it('submits review without Turnstile token when review protection is disabled', async () => {
    mockedApiAddProductReview.mockResolvedValue({
      productReviewId: 'r1',
      text: 'Nice coffee',
      createdAt: '',
    })

    renderReviewForm()

    fireEvent.change(screen.getByPlaceholderText(/what did you like/i), {
      target: { value: 'Nice coffee' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Submit review' }))

    await waitFor(() => {
      expect(mockedApiAddProductReview).toHaveBeenCalledWith(
        'p1',
        'Nice coffee',
        5,
        undefined,
      )
    })
    expect(screen.queryByRole('button', { name: 'Verify challenge' })).not.toBeInTheDocument()
  })

  it('blocks submission until Turnstile is completed when review protection is enabled', async () => {
    mockReviewsTurnstileEnabled = true

    renderReviewForm()

    expect(screen.queryByRole('button', { name: 'Verify challenge' })).not.toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText(/what did you like/i), {
      target: { value: 'Nice coffee' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Submit review' }))

    expect(mockedApiAddProductReview).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Verify challenge' })).toBeInTheDocument()
    expect(screen.getByText('Please complete verification before submitting your review.'))
      .toBeInTheDocument()
  })

  it('submits review with Turnstile token after verification', async () => {
    mockReviewsTurnstileEnabled = true
    mockedApiAddProductReview.mockResolvedValue({
      productReviewId: 'r1',
      text: 'Nice coffee',
      createdAt: '',
    })

    renderReviewForm()

    fireEvent.change(screen.getByPlaceholderText(/what did you like/i), {
      target: { value: 'Nice coffee' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Submit review' }))
    fireEvent.click(screen.getByRole('button', { name: 'Verify challenge' }))
    fireEvent.click(screen.getByRole('button', { name: 'Submit review' }))

    await waitFor(() => {
      expect(mockedApiAddProductReview).toHaveBeenCalledWith(
        'p1',
        'Nice coffee',
        5,
        'turnstile-token',
      )
    })
  })
})
