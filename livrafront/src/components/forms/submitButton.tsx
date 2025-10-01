/* Componente de botão de submit com estados de loading */

import { cn } from '@/utils/cn'

interface SubmitButtonProps {
  children: React.ReactNode
  isLoading?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export function SubmitButton({ children, isLoading = false, ...props }: SubmitButtonProps) {
  return (
    <button
      {...props}
      disabled={isLoading}
      className={cn(
        "w-full bg-green-600 hover:bg-green-700 text-white font-sans font-semibold", // ← font-sans
        "py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105",
        "focus:outline-none focus:ring-4 focus:ring-green-300 shadow-lg hover:shadow-xl",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
        "active:scale-95"
      )}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
          Carregando...
        </div>
      ) : (
        children
      )}
    </button>
  )
}