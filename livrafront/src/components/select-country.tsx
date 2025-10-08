'use client'

import { useState, useEffect, useRef } from 'react'
import { cn } from '@/utils/cn'

interface Country {
  name: string
  code: string
  flag: string
}

interface CountrySelectProps {
  label?: string
  error?: string
  helperText?: string
  value: string
  onChange: (value: string) => void
  variant?: 'default' | 'outline' | 'filled'
  inputSize?: 'small' | 'medium' | 'large'
  colorScheme?: string
  fullWidth?: boolean
  required?: boolean
}

export default function CountrySelect({
  label,
  error,
  helperText,
  value,
  onChange,
  variant = 'default',
  inputSize = 'medium',
  colorScheme = 'light-neutral',
  fullWidth = false,
  required = false
}: CountrySelectProps) {
  const [countries, setCountries] = useState<Country[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all?fields=name,cca2,flags')
      .then(res => res.json())
      .then(data => {
        const formattedCountries = data
          .map((country: any) => ({
            name: country.name.common,
            code: country.cca2,
            flag: country.flags.svg || country.flags.png
          }))
          .sort((a: Country, b: Country) => a.name.localeCompare(b.name))
        
        setCountries(formattedCountries)
        setLoading(false)
      })
      .catch(err => {
        console.error('Erro ao buscar países:', err)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedCountry = countries.find(c => c.name === value)

  const textStyle: Record<'small' | 'medium' | 'large', string> = {
    small:  'text-b3',
    medium: 'text-b2',
    large:  'text-b1'
  }

  const boxSize: Record<'small' | 'medium' | 'large', string> = {
    small:  "small-box",
    medium: "medium-box",
    large:  "large-box"
  }

  const auxTextStyle = "text-b3"
  const labelStyle = "body-semibold"

  return (
    <div className={cn('relative', fullWidth && 'w-full')} ref={dropdownRef}>
      {/* Label */}
      {label && (
        <label className={`${labelStyle} ${textStyle[inputSize]} block mb-1 text-start`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Select Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          // Base
          boxSize[inputSize],
          textStyle[inputSize],
          colorScheme,
          // Layout
          'w-full text-left rounded-lg',
          'flex items-center justify-between',
          // Border and Background
          'border-2 border-gray-300 bg-white',
          // Hover and Focus
          'hover:border-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-green-900 focus:ring-offset-1',
          'transition-all duration-200',
          // States
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-red-500 focus:ring-red-500 focus:border-red-500'
        )}
        style={{ border: '1px solid #ccc' }}

      >
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {selectedCountry ? (
            <>
              <img 
                src={selectedCountry.flag} 
                alt={selectedCountry.name}
                className="w-6 h-4 object-cover rounded flex-shrink-0"
              />
              <span className="text-gray-900 truncate">{selectedCountry.name}</span>
            </>
          ) : (
            <span className="text-gray-400">Selecione um país</span>
          )}
        </div>
        <svg
          className={cn('w-5 h-5 transition-transform flex-shrink-0 ml-2 text-gray-600', isOpen && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b">
            <input
              type="text"
              placeholder="Buscar país..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                'w-full px-3 py-2',
                'border border-gray-300 rounded-md',
                'focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-green-900',
                'text-b3',
                'text-left'
              )}
              autoFocus
            />
          </div>
          
          <div className="overflow-y-auto max-h-48">
            {loading ? (
              <div className="p-4 text-left text-gray-500 text-b3">Carregando países...</div>
            ) : filteredCountries.length === 0 ? (
              <div className="p-4 text-left text-gray-500 text-b3">Erro! Nenhum país encontrado</div>
            ) : (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => {
                    onChange(country.name)
                    setIsOpen(false)
                    setSearchTerm('')
                  }}
                  className={cn(
                    'w-full px-4 py-2',
                    'flex items-start justify-start space-x-3',
                    'hover:bg-gray-100 transition-colors',
                    textStyle[inputSize],
                    'text-left',
                    value === country.name && 'bg-green-50'
                  )}
                >
                  <img 
                    src={country.flag} 
                    alt={country.name}
                    className="w-6 h-4 object-cover rounded flex-shrink-0 mt-0.5"
                  />
                  <span className="text-gray-900 flex-1 text-left">{country.name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className={`${auxTextStyle} text-red-600 mt-1 text-left`}>
          {error}
        </p>
      )}

      {/* Helper */}
      {helperText && !error && (
        <p className={`${auxTextStyle} text-gray-500 mt-1 text-left`}>
          {helperText}
        </p>
      )}
    </div>
  )
}