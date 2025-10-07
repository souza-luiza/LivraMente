import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: ReactNode;      
  icon?: ReactNode;
  size?: "small" | "medium" | "large";
  colorScheme?: "light-green" | "dark-green" | "light-brown" | "dark-brown";
  loading?: boolean;
}

export default function Button({ 
    text, 
    icon, 
    size = "medium", 
    colorScheme = "dark-green", 
    loading = false, 
    disabled, 
    className,
    ...props 
}: ButtonProps) {

    const textStyles: Record<"small" | "medium" | "large", string> = {
        small:  "text-sm",
        medium: "text-base",
        large:  "text-lg"
    }

    const boxSize: Record<"small" | "medium" | "large", string> = {
        small:  "px-4 py-2 rounded-xl",
        medium: "px-6 py-3 rounded-xl",
        large:  "px-8 py-4 rounded-xl"
    }

    const colorSchemes: Record<"light-green" | "dark-green" | "light-brown" | "dark-brown", string> = {
        "light-green": "bg-[#B0CC9E] text-[#1F2A17]",
        "dark-green": "bg-[#3D552F] text-[#E5EEDF]",
        "light-brown": "bg-[#E8DDD4] text-[#472B15]",
        "dark-brown": "bg-[#472B15] text-[#E8DDD4]"
    }

    return (
        <button 
            className={`
                ${boxSize[size]} 
                ${colorSchemes[colorScheme]}
                ${textStyles[size]}
                flex items-center justify-center gap-2
                font-medium
                active:opacity-95
                hover:opacity-90 hover:cursor-pointer
                disabled:opacity-70 disabled:cursor-not-allowed
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#5C7C3D]
                transition-all duration-200
                ${className || ''}
            `}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <svg 
                    className="animate-spin h-4 w-4" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                >
                    <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                    />
                    <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            )}
            <span>{text}</span>
            {icon && <span>{icon}</span>}
        </button>
    );
}