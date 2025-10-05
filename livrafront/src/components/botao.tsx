import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: ReactNode;      
  icon: ReactNode;
  size: "small" | "medium" | "large";
  colorScheme: "light-green" | "dark-green" | "light-brown" | "dark-brown";
}

export default function Button({ text, icon, size, colorScheme }: ButtonProps) {

    const textStyles: Record<"small" | "medium" | "large", string> = {
        small:  "h6",
        medium: "h4",
        large:  "h2",
    };

    const iconSizes: Record<"small" | "medium" | "large", string> = {
        small:  "w-4 h-4",
        medium: "w-6 h-6",
        large:  "w-10 h-10",
    };

    return (
        <button className={`${size} ${colorScheme}`}>
            <span className={`${textStyles[size]}`}>
                {text}
            </span>
            <span className={`${iconSizes[size]}`}>
                {icon}
            </span>
        </button>
    );
}