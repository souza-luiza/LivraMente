import LogoIcon from './icons/LogoIcon'

interface LoadingComponentProps {
    size?: 'small' | 'medium' | 'large';
    className?: string;
}

export default function LoadingComponent({ 
    size = 'medium',
    ...props
}: LoadingComponentProps) {

    const spinningElement: Record<'small' | 'medium' | 'large', string> = {
        small: 'w-16 h-16 border-8',
        medium: 'w-32 h-32 border-12',
        large: 'w-48 h-48 border-16',
    };

    const logoElement: Record<'small' | 'medium' | 'large', string> = {
        small: 'w-8 h-8',
        medium: 'w-16 h-16',
        large: 'w-24 h-24',
    };

    return (
        <div data-testid="loading-middle" className={`relative flex items-center justify-center ${props.className}`}>
            <div data-testid="spinning-element" className={`absolute ${spinningElement[size]} border-[#B0CC9E] border-t-[#5C8046] rounded-full animate-[spin_1.5s_ease-in-out_infinite]`}>
            </div>
            <div data-testid="logo-container" className={`${logoElement[size]} text-[#1F2A17]`}>
                <LogoIcon />
            </div>
        </div>
    )
}