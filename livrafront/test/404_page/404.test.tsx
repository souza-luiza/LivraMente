import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotFoundPage from '@/app/not-found';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

jest.mock('next/link', () => {
    return ({ children, href }: { children: React.ReactNode; href: string }) => {
        return <a href={href}>{children}</a>;
    };
});

jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => {
        return <img {...props} />;
    },
}));

describe('NotFoundPage', () => {
    const mockBack = jest.fn();
    const mockPush = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({
            back: mockBack,
            push: mockPush,
        });
    });

    it('should render the 404 page with all elements', () => {
        render(<NotFoundPage />);
        
        expect(screen.getByText('Oops!')).toBeInTheDocument();
        expect(screen.getByText('A página que você está procurando não foi encontrada.')).toBeInTheDocument();
        expect(screen.getByText('Código de Erro: 404')).toBeInTheDocument();
    });

    it('should render the logo image', () => {
        render(<NotFoundPage />);
        
        const logo = screen.getByLabelText('Logo');
        expect(logo).toBeInTheDocument();
        // ErrorIcon is an inline SVG in tests environment; ensure it exists
        expect(logo).toBeTruthy();
    });

    it('should render back button with correct icon', () => {
        render(<NotFoundPage />);
        
        const backButton = screen.getByText('Voltar');
        expect(backButton).toBeInTheDocument();
        
        const backIcon = screen.getByLabelText('Ícone de seta');
        expect(backIcon).toBeInTheDocument();
    });

    it('should call router.back() when clicking back button', () => {
        render(<NotFoundPage />);
        
        const backButton = screen.getByText('Voltar');
        fireEvent.click(backButton);
        
        expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it('should render logo link that points to home', () => {
        render(<NotFoundPage />);
        
    const logoLink = screen.getByLabelText('Logo').closest('a');
        expect(logoLink).toHaveAttribute('href', '/');
    });

    it('should have correct styling classes', () => {
        const { container } = render(<NotFoundPage />);
        
        const mainDiv = container.firstChild;
        expect(mainDiv).toHaveClass('min-h-screen flex');
    });
});