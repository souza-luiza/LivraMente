'use client'

interface PasswordStrengthProps {
  password: string
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const calculateStrength = (pwd: string): number => {
    let strength = 0
    
    if (pwd.length >= 8) strength++
    if (pwd.length >= 12) strength++
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++
    if (/\d/.test(pwd)) strength++
    if (/[^a-zA-Z\d]/.test(pwd)) strength++
    
    return strength
  }

  const getStrengthData = (strength: number) => {
    if (strength === 0) return { label: '', color: 'bg-gray-200', width: '0%' }
    if (strength <= 2) return { label: 'Fraca', color: 'bg-red-500', width: '33%' }
    if (strength <= 3) return { label: 'Média', color: 'bg-yellow-500', width: '66%' }
    return { label: 'Forte', color: 'bg-green-500', width: '100%' }
  }

  const strength = calculateStrength(password)
  const { label, color, width } = getStrengthData(strength)

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600">Força da senha:</span>
        {label && <span className={`text-xs font-medium ${
          strength <= 2 ? 'text-red-600' : 
          strength <= 3 ? 'text-yellow-600' : 
          'text-green-600'
        }`}>{label}</span>}
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${color}`}
          style={{ width }}
        />
      </div>
      <div className="mt-2 space-y-1">
        <CheckItem text="Mínimo 8 caracteres" checked={password.length >= 8} />
        <CheckItem text="Letras maiúsculas e minúsculas" checked={/[a-z]/.test(password) && /[A-Z]/.test(password)} />
        <CheckItem text="Números" checked={/\d/.test(password)} />
        <CheckItem text="Caracteres especiais" checked={/[^a-zA-Z\d]/.test(password)} />
      </div>
    </div>
  )
}

function CheckItem({ text, checked }: { text: string; checked: boolean }) {
  return (
    <div className="flex items-center space-x-2">
      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
        checked ? 'bg-green-500' : 'bg-gray-300'
      }`}>
        {checked && <span className="text-white text-xs">✓</span>}
      </div>
      <span className={`text-xs ${checked ? 'text-green-700' : 'text-gray-500'}`}>
        {text}
      </span>
    </div>
  )
}