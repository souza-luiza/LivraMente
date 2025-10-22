import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfilePage from '@/app/profile/page';
import { useUserStore } from '@/stores/user-store';
import { useRouter } from 'next/navigation';
import '@testing-library/jest-dom';
import { profile } from 'console';

// Mock das dependências
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/stores/user-store', () => ({
  useUserStore: jest.fn(),
}));

describe('ProfilePage', () => {
  const mockRouterPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({
      push: mockRouterPush,
    });
  });

  it('deve exibir o nome de usuário e pronomes do store', () => {
    // Configura o estado que o store "falso" vai retornar para este teste
    (useUserStore as unknown as jest.Mock).mockReturnValue({
      username: '@test_user',
      pronouns: 'they/them',
    });

    render(<ProfilePage />);

    // Verifica se os dados do store estão na tela
    expect(screen.getByText('@test_user')).toBeInTheDocument();
    expect(screen.getByText('they/them')).toBeInTheDocument();
  });

  it('deve navegar para a página de edição ao clicar no botão Editar', async () => {
    const user = userEvent.setup();
    
    // Configura o store com dados quaisquer para o componente renderizar
    (useUserStore as unknown as jest.Mock).mockReturnValue({
      username: '@test_user',
      pronouns: 'they/them',
    });

    render(<ProfilePage />);

    const editButton = screen.getByRole('button', { name: /Editar/i });
    await user.click(editButton);

    // Verifica se a navegação foi chamada com o caminho correto
    expect(mockRouterPush).toHaveBeenCalledWith('/edit-profile');
  });
});