import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditProfilePage from '@/app/[username]/edit-profile/page';
import { useUserStore } from '@/stores/user-store';
import { useRouter } from 'next/navigation';
import '@testing-library/jest-dom';

// 1. Mock das dependências externas
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/stores/user-store', () => ({
  useUserStore: jest.fn(),
}));

// Mock para o toast, para não aparecer durante os testes
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe('EditProfilePage', () => {
  const mockSetUsername = jest.fn();
  const mockSetPronouns = jest.fn();
  const mockRouterPush = jest.fn();

  // 2. Configuração inicial antes de cada teste
  beforeEach(() => {
    // Reseta os mocks para cada teste ser independente
    jest.clearAllMocks();

    // Configura o retorno do mock do useRouter
    (useRouter as jest.Mock).mockReturnValue({
      push: mockRouterPush,
    });

    // Configura o retorno do mock do useUserStore
    (useUserStore as unknown as jest.Mock).mockReturnValue({
      username: '@gatanoturna',
      pronouns: 'ela/dela',
      profileImageUrl: '/kemi-teste.jpg',
      setUsername: mockSetUsername,
      setPronouns: mockSetPronouns,
      setProfileImageUrl: jest.fn(),
    });
  });

  it('deve exibir os dados iniciais do usuário vindos do store', () => {
    render(<EditProfilePage />);

    // Verifica se os inputs são preenchidos com os dados do store
    expect(screen.getByPlaceholderText('Novo nome de usuário')).toHaveValue('@gatanoturna');
    expect(screen.getByPlaceholderText('Ela/Dela, Ele/Dele, Etc...')).toHaveValue('ela/dela');
  });

  it('deve atualizar o estado do formulário ao digitar nos inputs', async () => {
    const user = userEvent.setup();
    render(<EditProfilePage />);

    const nameInput = screen.getByPlaceholderText('Novo nome de usuário');
    await user.clear(nameInput);
    await user.type(nameInput, 'novo_nome');
    expect(nameInput).toHaveValue('novo_nome');

    const pronounsInput = screen.getByPlaceholderText('Ela/Dela, Ele/Dele, Etc...');
    await user.clear(pronounsInput);
    await user.type(pronounsInput, 'ele/dele');
    expect(pronounsInput).toHaveValue('ele/dele');
  });

  it('deve chamar as funções do store ao salvar as alterações', async () => {
    const user = userEvent.setup();
    render(<EditProfilePage />);

    const nameInput = screen.getByPlaceholderText('Novo nome de usuário');
    await user.clear(nameInput);
    await user.type(nameInput, 'novo_usuario');

    const pronounsInput = screen.getByPlaceholderText('Ela/Dela, Ele/Dele, Etc...');
    await user.clear(pronounsInput);
    await user.type(pronounsInput, 'elu/delu');

    const saveButton = screen.getByRole('button', { name: /Salvar Alterações/i });
    await user.click(saveButton);

    // Verifica se as funções do store foram chamadas com os valores corretos
    expect(mockSetUsername).toHaveBeenCalledWith('novo_usuario');
    expect(mockSetPronouns).toHaveBeenCalledWith('elu/delu');
  });

  it('deve exibir um erro de validação se o nome estiver vazio', async () => {
    const user = userEvent.setup();
    render(<EditProfilePage />);

    const nameInput = screen.getByPlaceholderText('Novo nome de usuário');
    await user.clear(nameInput);

    const saveButton = screen.getByRole('button', { name: /Salvar Alterações/i });
    await user.click(saveButton);

    // Verifica se a mensagem de erro aparece
    expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument();
    // Verifica que a função de salvar NÃO foi chamada
    expect(mockSetUsername).not.toHaveBeenCalled();
  });

  it('deve navegar para a página de perfil ao clicar em Cancelar', async () => {
    const user = userEvent.setup();
    render(<EditProfilePage />);

    const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
    await user.click(cancelButton);

    // Verifica se o router.push foi chamado com o caminho correto
    expect(mockRouterPush).toHaveBeenCalledWith('/profile');
  });

  it('deve redirecionar para /login se o usuário não estiver logado', () => {
    (useUserStore as unknown as jest.Mock).mockReturnValue({
      username: '', 
      pronouns: '',
      profileImageUrl: '/default-url.png', // Deve ter um valor (ou null) para o useEffect rodar
      setUsername: mockSetUsername,
      setPronouns: mockSetPronouns,
      setProfileImageUrl: jest.fn(),
    });

    render(<EditProfilePage />);

    expect(mockRouterPush).toHaveBeenCalledWith('/login');

    expect(screen.queryByRole('heading', { name: /Editar Perfil/i })).not.toBeInTheDocument();
  });
});