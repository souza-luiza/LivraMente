import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  variant?: 'default' | 'outline' | 'filled'
  inputSize?: 'sm' | 'md' | 'lg'
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  variant = 'default',
  inputSize = 'md',
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

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
      'focus:ring-blue-500 focus:border-blue-500',
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

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-3 py-2 text-base rounded-lg',
    lg: 'px-4 py-3 text-lg rounded-lg'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const inputClasses = cn(
    baseClasses,
    variants[variant],
    sizes[inputSize],
    leftIcon && 'pl-10',
    rightIcon && 'pr-10',
    fullWidth ? 'w-full' : 'w-auto',
    error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
    className
  )

  return (
    <div className={cn('relative', fullWidth && 'w-full')}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className={cn('text-gray-400', iconSizes[inputSize])}>
              {leftIcon}
            </div>
          </div>
        )}

        {/* Input */}
        <input
          ref={ref}
          id={inputId}
          className={inputClasses}
          {...props}
        />

        {/* Right Icon */}
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className={cn('text-gray-400', iconSizes[inputSize])}>
              {rightIcon}
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input