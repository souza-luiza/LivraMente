"use client";

import { ButtonHTMLAttributes, ReactNode, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text?: ReactNode;      
  icon: ReactNode;
  size?: "small" | "medium" | "large";
  colorScheme?: "light-green" | "dark-green" | "light-brown" | "dark-brown"  | "light-neutral";
  variant?: "normal" | "aprovar" | "rejeitar";
  path?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  loading?: boolean;
  tooltip?: string;
}

export default function Button({ 
    text, 
    icon, 
    size='medium', 
    colorScheme='light-green',
    variant='normal',
    path,
    onClick, 
    loading = false,
    tooltip, 
    disabled, 
    ...props 
}: ButtonProps) {

    const [isHovered, setIsHovered] = useState(false);

    const router = useRouter();

    const textStyles: Record<"small" | "medium" | "large", string> = {
        small:  "text-b2 body-semibold",
        medium: "text-h6",
        large:  "text-h4"
    }

    const iconSizes: Record<"small" | "medium" | "large", string> = {
        small:  "icon-small",
        medium: "icon-medium",
        large:  text ? "icon-large" : "w-8 h-8"
    }

    const boxSize: Record<"small" | "medium" | "large", string> = {
        small:  text ? "small-box"  : "p-2 small-border-radius",
        medium: text ? "medium-box" : "small-padding medium-border-radius",
        large:  text ? "large-box"  : "small-padding large-border-radius",
    }

    const variantColorScheme: Record<"normal" | "aprovar" | "rejeitar", string> = {
        normal: "",
        aprovar: "bg-[var(--success-100)] text-[var(--success-600)]",
        rejeitar: "bg-[var(--error-100)] text-[var(--error-600)]"
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (onClick) onClick(e);
        if (loading || disabled || e.defaultPrevented || !path) return;

        if (/^https?:\/\//.test(path)) {
            window.open(path, "_blank", "noopener,noreferrer");
        } else if (typeof window !== 'undefined') {
            router.push(path);
        }
    };

    return (
        <div className="relative group">
            <button className={`${boxSize[size]} ${((variant == "aprovar") || (variant == "rejeitar")) ? variantColorScheme[variant] : colorScheme}
                    active:opacity-95
                    hover:opacity-90 hover:cursor-pointer
                    disabled:opacity-70 disabled:cursor-not-allowed
                    focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black`}
                    onClick={handleClick}
                    disabled={disabled || loading}
                    {...props}

                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
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
                {text && (
                    <span className={`${textStyles[size]}`}> {text} </span>
                )}
                <span className={`${iconSizes[size]}`}> {icon} </span>
            </button>
            {tooltip != undefined && (
                <AnimatePresence>
                    {isHovered && (
                        <motion.div 
                            data-testid="tooltip" 
                            className={`absolute left-full ml-2 top-1/2 -translate-y-1/2 px-[10px] py-[5px] dark-brown text-h6 rounded-[8px] whitespace-nowrap pointer-events-none`}
                            role="tooltip"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {tooltip}
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </div>
    );
}