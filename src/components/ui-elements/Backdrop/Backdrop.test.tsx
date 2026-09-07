import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Backdrop from './Backdrop'

describe('Backdrop', () => {
  it('renders nothing when closed', () => {
    const { container } = render(<Backdrop isOpen={false} onClick={vi.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('calls onClick when open and clicked', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    const { container } = render(<Backdrop isOpen onClick={onClick} />)

    await user.click(container.firstElementChild as HTMLElement)
    expect(onClick).toHaveBeenCalledOnce()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
