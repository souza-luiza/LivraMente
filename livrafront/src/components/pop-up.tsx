import { motion, AnimatePresence } from "framer-motion";
import Button from "./button";
import { useEffect } from "react";

interface PopUpProps {
    title: string;
    description?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    button1?: {
        text?: string,
        icon: React.ReactNode,
        colorScheme?: "light-green" | "dark-green" | "light-brown" | "dark-brown" | "light-neutral",
        path?: string,
        onClick?: () => void
    };
    button2?: {
        text?: string,
        icon: React.ReactNode,
        colorScheme?:"light-green" | "dark-green" | "light-brown" | "dark-brown" | "light-neutral",
        path?: string,
        onClick?: () => void
    };
    disableActions?: boolean;
    isOpen: boolean;
    onClose?: () => void;
    onSuccess?: () => void;
}

export default function PopUp({ 
    title,
    description,
    leftIcon,
    rightIcon,
    button1,
    button2,
    disableActions = false,
    isOpen,
    onClose
}: PopUpProps) {

    useEffect(() => {
        if (isOpen) {
            // Desabilita scrollagem da página ao abrir o modal
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            
            return () => {
                document.body.style.overflow = originalOverflow;
            };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                className="fixed inset-0 flex items-center justify-center z-50"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                onClick={onClose}
            >
                <div 
                    className="flex flex-shrink-0 flex-col items-center justify-center large-padding medium-border-radius light-green gap-3"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex flex-row items-center justify-between gap-2">
                        {leftIcon && <span className="icon-medium">{leftIcon}</span>}
                        <h1 className="text-center text-h5">{title}</h1>
                        {rightIcon && <span className="icon-medium">{rightIcon}</span>}
                    </div>
                    {description && <p className="text-center text-b2">{description}</p>}
                    {(button1 || button2) && <div className="flex flex-row items-center justify-center gap-1">
                        {button1 && <Button
                            text={button1.text}
                            icon={button1.icon}
                            colorScheme={button1.colorScheme}
                            size="medium"
                            path={button1.path}
                            onClick={button1.onClick}
                            disabled={disableActions} 
                        />}
                        {button2 && <Button
                            text={button2.text}
                            icon={button2.icon}
                            colorScheme={button2.colorScheme}
                            size="medium"
                            path={button2.path}
                            onClick={button2.onClick}
                            disabled={disableActions}  
                        />}
                    </div>}
                </div>
            </motion.div>
        </AnimatePresence>
    )
}