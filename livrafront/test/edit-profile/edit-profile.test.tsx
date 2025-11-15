import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation'; // Mock do roteador
import EditProfilePage from '@/app/[username]/editar-perfil/page';

// Mockar o uso do roteador do Next.js
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn().mockReturnValue({ username: 'testuser' }), // Mock do parâmetro 'username'
}));

describe('EditProfilePage', () => {
  // Antes de cada teste, configurar o mock do router
  const mockReplace = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      replace: mockReplace,
      push: jest.fn(),
    });
  });

  test('deve renderizar a página corretamente com os dados do usuário', async () => {
    render(<EditProfilePage />);

    await waitFor(() => {
      expect(screen.getByLabelText('Nome de Usuário')).toHaveValue('');
    });
  });

  test('deve chamar router.replace se o usuário não for encontrado', async () => {
    render(<EditProfilePage />);

    // Verifica se router.replace foi chamado com o caminho correto
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/entrar');
    });
  });
});