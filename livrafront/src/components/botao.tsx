import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: ReactNode;      
  icon: ReactNode;
  size: "small" | "medium" | "large";
  colorScheme: "light-green" | "dark-green" | "light-brown" | "dark-brown";
}

export default function Button({ text, icon, size, colorScheme, ...props }: ButtonProps) {

    const textStyles: Record<"small" | "medium" | "large", string> = {
        small:  "text-h6",
        medium: "text-h4",
        large:  "text-h2",
    };

    const iconSizes: Record<"small" | "medium" | "large", string> = {
        small:  "w-4 h-4",
        medium: "w-6 h-6",
        large:  "w-10 h-10",
    };

    return (
        <button className={`${size} ${colorScheme}
                active:opacity-95
                hover:opacity-90 hover:cursor-pointer
                disabled:opacity-70 disabled:cursor-not-allowed
                focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black`}
                {...props}
        >
            <span className={`${textStyles[size]}`}>
                {text}
            </span>
            <span className={`${iconSizes[size]}`}>
                {icon}
            </span>
        </button>
    );
}