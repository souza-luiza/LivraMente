import React, { InputHTMLAttributes, forwardRef, useId } from 'react'
import { cn } from '@/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: React.ReactNode
  variant?: 'default' | 'outline' | 'filled'
  inputSize?: 'small' | 'medium' | 'large'
  colorScheme?: string
  fullWidth?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  variant = 'default',
  inputSize = 'medium',
  colorScheme = 'light-neutral',
  fullWidth = false,
  className,
  id,
  ...props
}, ref) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  const baseClasses = [
    'transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-1',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'placeholder:text-gray-400',
    'text-gray-900',
  ]

  const variants = {
    default: [
      'border border-gray-300 bg-white',
      'focus:ring-green-900 focus:border-green-900',
      'hover:border-gray-400'
    ],
    outline: [  
      'border-2 border-gray-300 bg-transparent',
      'focus:ring-blue-500 focus:border-blue-500',
      'hover:border-gray-400'
    ],
    filled: [
      'border border-gray-200 bg-gray-50',
      'focus:ring-blue-500 focus:border-blue-500 focus:bg-white',
      'hover:bg-gray-100'
    ]
  }

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

  const auxTextStyle = "text-b3";

  const labelStyle = "body-semibold";

  const inputClasses = cn(
    baseClasses,
    variants[variant],
    boxSize[inputSize],  
    textStyle[inputSize],
    fullWidth ? 'w-full' : 'w-auto',
    error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
    className
  )

  return (
    <div className={`relative ${fullWidth && 'w-full'}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={inputId}
          className={`${labelStyle} ${textStyle[inputSize]}`}
        >
          {label}
        </label>
      )}

      {/* Input Container */}
      <input
        ref={ref}
        id={inputId}
        className={`${inputClasses} ${colorScheme} ${baseClasses.join(' ')}`}
        {...props}
      />

      {/* Error Message */}
      {error && (
        <p className={`${auxTextStyle} text-red-600 mt-1`}>
          {error}
        </p>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p className={`${auxTextStyle} text-gray-500 mt-1`}>
          {helperText}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input