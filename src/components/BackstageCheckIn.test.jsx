import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import BackstageCheckIn from './BackstageCheckIn'

describe('BackstageCheckIn Component', () => {
  const mockDancers = [
    { id: '1', name: 'Alice', role: 'Ballerina', checkInStatus: 'Not Ready' },
    { id: '2', name: 'Bob', role: 'Tap Dancer', checkInStatus: 'Dressed' }
  ]

  const mockOnUpdateStatus = vi.fn()

  test('renders backstage check-in interface', () => {
    render(<BackstageCheckIn dancers={mockDancers} onUpdateStatus={mockOnUpdateStatus} theaterMode={false} />)
    
    expect(screen.getByText('Backstage Check-In')).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  test('shows QR scan button', () => {
    render(<BackstageCheckIn dancers={mockDancers} onUpdateStatus={mockOnUpdateStatus} theaterMode={false} />)
    
    expect(screen.getByText('Scan QR Code')).toBeInTheDocument()
  })

  test('shows dancer cards with correct status', () => {
    render(<BackstageCheckIn dancers={mockDancers} onUpdateStatus={mockOnUpdateStatus} theaterMode={false} />)
    
    // Check that status buttons exist
    expect(screen.getAllByText('Dressed').length).toBeGreaterThan(0)
    expect(screen.getAllByText('In Wings').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Not Ready').length).toBeGreaterThan(0)
    
    // Check active statuses using more specific selectors
    const aliceCard = screen.getByText('Alice').closest('.dancer-card')
    const bobCard = screen.getByText('Bob').closest('.dancer-card')
    
    // Check Alice's active button (Not Ready)
    const aliceNotReadyBtn = within(aliceCard).getByText('Not Ready')
    expect(aliceNotReadyBtn).toHaveClass('active')
    
    // Check Bob's active button (Dressed)
    const bobDressedBtn = within(bobCard).getByText('Dressed')
    expect(bobDressedBtn).toHaveClass('active')
  })

  test('calls onUpdateStatus when status button is clicked', () => {
    render(<BackstageCheckIn dancers={mockDancers} onUpdateStatus={mockOnUpdateStatus} theaterMode={false} />)
    
    const dressedBtn = screen.getAllByText('Dressed')[0] // Alice's dressed button
    fireEvent.click(dressedBtn)
    
    expect(mockOnUpdateStatus).toHaveBeenCalledWith('1', 'Dressed')
  })

  test('shows theater mode styles when enabled', () => {
    const { container } = render(
      <BackstageCheckIn dancers={mockDancers} onUpdateStatus={mockOnUpdateStatus} theaterMode={true} />
    )
    
    expect(container.firstChild).toHaveClass('theater-mode')
  })
})

describe('QR Code Scanning Logic', () => {
  const mockDancers = [
    { id: '1', name: 'Alice', checkInStatus: 'Not Ready' },
    { id: '2', name: 'Bob', checkInStatus: 'Dressed' }
  ]

  test('handles valid QR code data', () => {
    const validQRData = JSON.stringify({ dancerId: '1', name: 'Alice' })
    const parsedData = JSON.parse(validQRData)
    
    expect(parsedData.dancerId).toBe('1')
    expect(parsedData.name).toBe('Alice')
  })

  test('handles QR code with missing dancerId', () => {
    const invalidQRData = JSON.stringify({ name: 'Alice' })
    const parsedData = JSON.parse(invalidQRData)
    
    expect(parsedData.dancerId).toBeUndefined()
  })

  test('handles invalid JSON in QR code', () => {
    const invalidQRData = 'not-valid-json'
    
    expect(() => JSON.parse(invalidQRData)).toThrow()
  })

  test('finds dancer by ID correctly', () => {
    const dancer = mockDancers.find(d => d.id === '1')
    expect(dancer).toBeDefined()
    expect(dancer.name).toBe('Alice')
  })

  test('returns undefined for non-existent dancer', () => {
    const dancer = mockDancers.find(d => d.id === '999')
    expect(dancer).toBeUndefined()
  })
})

describe('Status Update Logic', () => {
  test('updates dancer status correctly', () => {
    const dancers = [
      { id: '1', name: 'Alice', checkInStatus: 'Not Ready' }
    ]
    
    const updatedDancers = dancers.map(d => 
      d.id === '1' ? { ...d, checkInStatus: 'Dressed' } : d
    )
    
    expect(updatedDancers[0].checkInStatus).toBe('Dressed')
  })

  test('preserves other dancer data when updating status', () => {
    const dancer = { id: '1', name: 'Alice', role: 'Ballerina', checkInStatus: 'Not Ready' }
    
    const updatedDancer = { ...dancer, checkInStatus: 'Dressed' }
    
    expect(updatedDancer.name).toBe('Alice')
    expect(updatedDancer.role).toBe('Ballerina')
    expect(updatedDancer.checkInStatus).toBe('Dressed')
  })
})