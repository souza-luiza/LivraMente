/* Componente  para inputs do formulário de login */

import { forwardRef } from 'react'

interface LoginInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  fieldClassName?: string 
}

export const LoginInput = forwardRef<HTMLInputElement, LoginInputProps>(
  ({ error, className, fieldClassName, ...props }, ref) => {
    return (
      <div className={fieldClassName || 'mb-4'}>
        <input
          ref={ref}
          className={className || `w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          {...props}
        />
        {error && (
          <p className="text-red-500 text-sm mt-1">{error}</p>
        )}
      </div>
    )
  }
)

LoginInput.displayName = 'LoginInput'