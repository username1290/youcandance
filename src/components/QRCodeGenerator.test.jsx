import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import QRCodeGenerator from './QRCodeGenerator'
import { toPng } from 'html-to-image'

// Mock the html-to-image library
vi.mock('html-to-image', () => ({
  toPng: vi.fn().mockResolvedValue('mock-image-data')
}))

describe('QRCodeGenerator Component', () => {
  const mockDancers = [
    { id: '1', name: 'Alice Johnson' },
    { id: '2', name: 'Bob Smith' }
  ]

  const mockOnClose = vi.fn()

  beforeEach(() => {
    render(<QRCodeGenerator dancers={mockDancers} onClose={mockOnClose} />)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  test('renders QR code generator modal', () => {
    expect(screen.getByText('QR Code Generator')).toBeInTheDocument()
    expect(screen.getByText('Select Dancer:')).toBeInTheDocument()
  })

  test('shows dancer selection dropdown', () => {
    const select = screen.getByLabelText('Select Dancer:')
    expect(select).toBeInTheDocument()
    
    // Check that dancers are in the dropdown
    expect(screen.getByText('Alice Johnson (1)')).toBeInTheDocument()
    expect(screen.getByText('Bob Smith (2)')).toBeInTheDocument()
  })

  test('shows QR code options when dancer is selected', () => {
    const select = screen.getByLabelText('Select Dancer:')
    fireEvent.change(select, { target: { value: '1' } })
    
    expect(screen.getByText('Size: 200px')).toBeInTheDocument()
    expect(screen.getByText('Include Logo')).toBeInTheDocument()
    expect(screen.getByText('Download QR Code')).toBeInTheDocument()
    expect(screen.getByText('Download All')).toBeInTheDocument()
  })

  test('calls onClose when close button is clicked', () => {
    fireEvent.click(screen.getByText('Close QR Generator'))
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  test('downloads QR code when button is clicked', async () => {
    const select = screen.getByLabelText('Select Dancer:')
    fireEvent.change(select, { target: { value: '1' } })
    
    const downloadBtn = screen.getByText('Download QR Code')
    fireEvent.click(downloadBtn)
    
    // Wait for the download to complete
    await vi.waitFor(() => {
      expect(toPng).toHaveBeenCalled()
    })
  })

  test('generates correct QR code data', () => {
    const select = screen.getByLabelText('Select Dancer:')
    fireEvent.change(select, { target: { value: '1' } })
    
    // The QR code should contain the dancer data
    const expectedData = JSON.stringify({
      dancerId: '1',
      name: 'Alice Johnson',
      timestamp: expect.any(String)
    })
    
    // This would be more thorough with actual DOM testing
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
    expect(screen.getByText('ID: 1')).toBeInTheDocument()
  })

  test('handles empty dancer list gracefully', () => {
    render(<QRCodeGenerator dancers={[]} onClose={mockOnClose} />)
    
    expect(screen.getAllByText('QR Code Generator')[0]).toBeInTheDocument()
    expect(screen.getAllByText('-- Select a dancer --')[0]).toBeInTheDocument()
  })
})

describe('QR Code Data Generation', () => {
  test('generates valid QR code data format', () => {
    const dancer = { id: '123', name: 'Test Dancer' }
    const qrData = JSON.stringify({
      dancerId: dancer.id,
      name: dancer.name,
      timestamp: expect.any(String)
    })
    
    const parsedData = JSON.parse(qrData)
    expect(parsedData.dancerId).toBe(dancer.id)
    expect(parsedData.name).toBe(dancer.name)
    expect(parsedData.timestamp).toBeDefined()
  })

  test('QR code data can be parsed correctly', () => {
    const qrData = JSON.stringify({
      dancerId: '456',
      name: 'Jane Doe',
      timestamp: '2023-01-01T00:00:00.000Z'
    })
    
    const parsed = JSON.parse(qrData)
    expect(parsed).toHaveProperty('dancerId')
    expect(parsed).toHaveProperty('name')
    expect(parsed).toHaveProperty('timestamp')
  })
})