import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  size: "small" | "medium" | "large";
  colorScheme: "light-green" | "dark-green" | "light-brown" | "dark-brown";
  loading?: boolean;
  tooltip?: string;
}

export default function TextlessButton({
    icon, 
    size, 
    colorScheme, 
    loading = false,
    tooltip,
    disabled,
    ...props 
}: ButtonProps) {
    
    const textlessSizes: Record<"small" | "medium" | "large", string> = {
        small:  "textless-small",
        medium: "textless-medium",
        large:  "textless-large",
    };

    const iconSizes: Record<"small" | "medium" | "large", string> = {
        small:  "w-4 h-4",
        medium: "w-6 h-6",
        large:  "w-10 h-10",
    };

    return (
        <div className="relative flex justify-center group">
        <button className={`${textlessSizes[size]} ${colorScheme}
                active:opacity-95
                hover:opacity-90 hover:cursor-pointer
                disabled:opacity-70 disabled:cursor-not-allowed
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black`}
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
            <span className={`${iconSizes[size]}`}> {icon} </span>
        </button>
        {tooltip != undefined && (
            <div data-testid="tooltip" className={`absolute left-full ml-1 top-1/2 -translate-y-1/2 px-[10px] py-[5px] dark-brown text-h6 rounded-[8px] opacity-0 group-hover:opacity-100 transition-opacity duration-100`}>
                {tooltip}
            </div>
        )}
        </div>
    );
}