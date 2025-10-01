/*Componente para exibir mensagens de erro da API*/

interface ErrorMessageProps {
  message: string
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null

  return (
    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg animate-fade-in shadow-sm">
      <p className="text-sm flex items-center font-sans font-medium"> {/* ← font-sans */}
        <span className="text-red-500 mr-2">⚠️</span>
        <strong className="font-semibold">Erro:</strong> 
        <span className="ml-1 font-normal">{message}</span>
      </p>
    </div>
  )
}