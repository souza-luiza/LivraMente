'use client'

import { useState } from 'react'
import PhoneInput from 'react-phone-number-input'
import pt from 'react-phone-number-input/locale/pt-BR.json'
import 'react-phone-number-input/style.css'
import { cn } from '@/utils/cn'

interface PhoneInputComponentProps {
  label?: string
  error?: string
  helperText?: string
  value: string
  onChange: (value: string) => void
  inputSize?: 'small' | 'medium' | 'large'
  fullWidth?: boolean
  required?: boolean
  placeholder?: string
}

export default function PhoneInputComponent({
  label,
  error,
  helperText,
  value,
  onChange,
  inputSize = 'medium',
  fullWidth = false,
  required = false,
  placeholder = 'Digite seu telefone'
}: PhoneInputComponentProps) {
  const textStyle: Record<'small' | 'medium' | 'large', string> = {
    small: 'text-b3',
    medium: 'text-b2',
    large: 'text-b1'
  }

  const boxSize: Record<'small' | 'medium' | 'large', string> = {
    small: 'small-box',
    medium: 'medium-box',
    large: 'large-box'
  }

  const auxTextStyle = 'text-b3'
  const labelStyle = 'body-semibold'

  return (
    <div className={cn('relative', fullWidth && 'w-full')}>
      {/* Label */}
      {label && (
        <label className={`${labelStyle} ${textStyle[inputSize]} block mb-1`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Phone Input */}
      <PhoneInput
        international
        defaultCountry="BR"
        labels={pt}
        value={value}
        onChange={(val) => onChange(val || '')}
        placeholder={placeholder}
        className={cn(
          boxSize[inputSize],
          textStyle[inputSize],
          'w-full rounded-lg',
          'border-2 border-gray-300 bg-white',
          'focus-within:ring-2 focus-within:ring-green-900 focus-within:border-green-900 focus-within:ring-offset-1',
          'hover:border-gray-400',
          'transition-all duration-200',
          error && 'border-red-500 focus-within:ring-red-500 focus-within:border-red-500',
          '[&_.PhoneInputInput]:border-none [&_.PhoneInputInput]:outline-none [&_.PhoneInputInput]:w-full [&_.PhoneInputInput]:bg-transparent',
          '[&_.PhoneInputCountry]:mr-2',
          '[&_.PhoneInputCountryIcon]:rounded [&_.PhoneInputCountryIcon]:object-cover',
          '[&_.PhoneInputInput]:pr-3'
        )}
      />

      {/* Error Message */}
      {error && (
        <p className={`${auxTextStyle} text-red-600 mt-1`}>{error}</p>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p className={`${auxTextStyle} text-gray-500 mt-1`}>{helperText}</p>
      )}
    </div>
  )
}