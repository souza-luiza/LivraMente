import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import CountrySelect from '@/components/select-country'

// Mock do fetch
global.fetch = jest.fn()

const mockCountries = [
  {
    name: { common: 'Brazil' },
    cca2: 'BR',
    flags: { svg: 'brazil-flag.svg', png: 'brazil-flag.png' },
    translations: { por: { common: 'Brasil' } }
  },
  {
    name: { common: 'United States' },
    cca2: 'US',
    flags: { svg: 'us-flag.svg', png: 'us-flag.png' },
    translations: { por: { common: 'Estados Unidos' } }
  },
  {
    name: { common: 'Argentina' },
    cca2: 'AR',
    flags: { svg: 'ar-flag.svg', png: 'ar-flag.png' },
    translations: { por: { common: 'Argentina' } }
  }
]

describe('CountrySelect', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      json: async () => mockCountries
    })
  })

  it('should render with placeholder text', async () => {
    render(<CountrySelect value="" onChange={mockOnChange} />)
    
    await waitFor(() => {
      expect(screen.queryByText('Carregando países...')).not.toBeInTheDocument()
    })
    
    expect(screen.getByText('Selecione um país')).toBeInTheDocument()
  })

  it('should render with label and required indicator', async () => {
    render(
      <CountrySelect
        value=""
        onChange={mockOnChange}
        label="País"
        required
      />
    )

    await waitFor(() => {
      expect(screen.queryByText('Carregando países...')).not.toBeInTheDocument()
    })

    expect(screen.getByText('País')).toBeInTheDocument()
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('should open dropdown when button is clicked', async () => {
    render(<CountrySelect value="" onChange={mockOnChange} />)

    await waitFor(() => {
      expect(screen.queryByText('Carregando países...')).not.toBeInTheDocument()
    })

    const button = screen.getByRole('button', { name: /selecione um país/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Buscar país...')).toBeInTheDocument()
    })
  })

  it('should display countries in dropdown', async () => {
    render(<CountrySelect value="" onChange={mockOnChange} />)

    await waitFor(() => {
      expect(screen.queryByText('Carregando países...')).not.toBeInTheDocument()
    })

    const button = screen.getByRole('button', { name: /selecione um país/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Brasil')).toBeInTheDocument()
      expect(screen.getByText('Estados Unidos')).toBeInTheDocument()
      expect(screen.getByText('Argentina')).toBeInTheDocument()
    })
  })

  it('should filter countries by search term', async () => {
    render(<CountrySelect value="" onChange={mockOnChange} />)

    await waitFor(() => {
      expect(screen.queryByText('Carregando países...')).not.toBeInTheDocument()
    })

    const button = screen.getByRole('button', { name: /selecione um país/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Buscar país...')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Buscar país...')
    fireEvent.change(searchInput, { target: { value: 'Bras' } })

    await waitFor(() => {
      expect(screen.getByText('Brasil')).toBeInTheDocument()
      expect(screen.queryByText('Estados Unidos')).not.toBeInTheDocument()
    })
  })

  it('should call onChange when country is selected', async () => {
    render(<CountrySelect value="" onChange={mockOnChange} />)

    await waitFor(() => {
      expect(screen.queryByText('Carregando países...')).not.toBeInTheDocument()
    })

    const button = screen.getByRole('button', { name: /selecione um país/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Brasil')).toBeInTheDocument()
    })

    const brasilButton = screen.getByText('Brasil')
    fireEvent.click(brasilButton)

    expect(mockOnChange).toHaveBeenCalledWith('Brasil')
  })

  it('should display selected country', async () => {
    const { container } = render(<CountrySelect value="Brasil" onChange={mockOnChange} />)

    await waitFor(() => {
      expect(screen.queryByText('Carregando países...')).not.toBeInTheDocument()
    })

    await waitFor(() => {
      const button = container.querySelector('button')
      expect(button?.textContent).toContain('Brasil')
    })

    expect(screen.getByAltText('Brasil')).toBeInTheDocument()
  })

  it('should display error message', async () => {
    render(
      <CountrySelect
        value=""
        onChange={mockOnChange}
        error="Campo obrigatório"
      />
    )

    await waitFor(() => {
      expect(screen.queryByText('Carregando países...')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Campo obrigatório')).toBeInTheDocument()
  })

  it('should display helper text', async () => {
    render(
      <CountrySelect
        value=""
        onChange={mockOnChange}
        helperText="Selecione seu país de origem"
      />
    )

    await waitFor(() => {
      expect(screen.queryByText('Carregando países...')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Selecione seu país de origem')).toBeInTheDocument()
  })

  it('should close dropdown when clicking outside', async () => {
    render(<CountrySelect value="" onChange={mockOnChange} />)

    await waitFor(() => {
      expect(screen.queryByText('Carregando países...')).not.toBeInTheDocument()
    })

    const button = screen.getByRole('button', { name: /selecione um país/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Buscar país...')).toBeInTheDocument()
    })

    fireEvent.mouseDown(document.body)

    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Buscar país...')).not.toBeInTheDocument()
    })
  })

  it('should handle fetch error', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))
    const consoleError = jest.spyOn(console, 'error').mockImplementation()

    render(<CountrySelect value="" onChange={mockOnChange} />)

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled()
    })

    consoleError.mockRestore()
  })

  it('should show loading state', async () => {
    let resolvePromise: (value: any) => void
    ;(global.fetch as jest.Mock).mockImplementation(
      () => new Promise((resolve) => { resolvePromise = resolve })
    )

    render(<CountrySelect value="" onChange={mockOnChange} />)

    const button = screen.getByRole('button', { name: /selecione um país/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Carregando países...')).toBeInTheDocument()
    })

    // Resolve the promise to avoid memory leaks
    await waitFor(() => {
      resolvePromise!({ json: async () => mockCountries })
    })
  })

  it('should show no results message when filter returns empty', async () => {
    render(<CountrySelect value="" onChange={mockOnChange} />)

    await waitFor(() => {
      expect(screen.queryByText('Carregando países...')).not.toBeInTheDocument()
    })

    const button = screen.getByRole('button', { name: /selecione um país/i })
    fireEvent.click(button)

    const searchInput = await screen.findByPlaceholderText('Buscar país...')
    fireEvent.change(searchInput, { target: { value: 'xyz123' } })

    await waitFor(() => {
      expect(screen.getByText('Erro! Nenhum país encontrado')).toBeInTheDocument()
    })
  })
})