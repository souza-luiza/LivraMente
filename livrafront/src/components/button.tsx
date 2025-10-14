import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: ReactNode;      
  icon: ReactNode;
  size: "small" | "medium" | "large";
  colorScheme: "light-green" | "dark-green" | "light-brown" | "dark-brown"  | "light-neutral";
  loading?: boolean;
}

export default function Button({ 
    text, 
    icon, 
    size='medium', 
    colorScheme, 
    loading = false, 
    disabled, 
    ...props 
}: ButtonProps) {

    const textStyles: Record<"small" | "medium" | "large", string> = {
        small:  "text-b2 body-semibold",
        medium: "text-h6",
        large:  "text-h4"
    }

    const iconSizes: Record<"small" | "medium" | "large", string> = {
        small:      "icon-small",
        medium:     "icon-medium",
        large:      "icon-large"
    }

    const boxSize: Record<"small" | "medium" | "large", string> = {
        small:      "small-box",
        medium:     "medium-box",
        large:      "large-box"
    }

    return (
        <button className={`${boxSize[size]} ${colorScheme}
                active:opacity-95
                hover:opacity-90 hover:cursor-pointer
                disabled:opacity-70 disabled:cursor-not-allowed
                focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black`}
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
            <span className={`${textStyles[size]}`}> {text} </span>
            <span className={`${iconSizes[size]}`}> {icon} </span>
        </button>
    );
}