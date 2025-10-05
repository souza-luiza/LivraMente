/* Componente de botão de submit com estados de loading */

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  children: React.ReactNode
}

export function SubmitButton({ 
  isLoading = false, 
  children, 
  className, 
  disabled,
  ...props 
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || isLoading}
      className={className || `w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 
                 disabled:opacity-50 disabled:cursor-not-allowed 
                 transition-colors duration-200 font-medium
                 ${isLoading ? 'cursor-wait' : ''}`}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
          Carregando...
        </div>
      ) : (
        children
      )}
    </button>
  )
}