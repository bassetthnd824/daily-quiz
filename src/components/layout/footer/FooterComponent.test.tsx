import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import FooterComponent from './FooterComponent'

describe('FooterComponent', () => {
  it('renders the footer copy', () => {
    render(<FooterComponent />)
    expect(screen.getByText('This is the Daily Quiz footer.')).toBeInTheDocument()
  })
})
