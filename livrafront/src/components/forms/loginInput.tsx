/* Componente  para inputs do formulário de login */

import { cn } from '@/utils/cn'

interface LoginInputProps {
  id: string
  name: string
  type: string
  placeholder: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
  required?: boolean
}

export function LoginInput({ id, name, type, placeholder, 
  value, onChange, error, required = false }: LoginInputProps) {
  return (
    <div className="mb-4">
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={cn(
          "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2",
          "transition-all duration-200 ease-in-out font-sans", // ← usa --font-sans (Poppins)
          "hover:border-green-400 focus:border-green-600",
          "placeholder:text-gray-400 text-gray-900 shadow-sm hover:shadow-md",
          error 
            ? "border-red-500 focus:ring-red-200 bg-red-50" 
            : "border-green-300 focus:ring-green-200 focus:bg-green-50"
        )}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1 font-medium font-sans"> {/* ← usa font-sans */}
          {error}
        </p>
      )}
    </div>
  )
}