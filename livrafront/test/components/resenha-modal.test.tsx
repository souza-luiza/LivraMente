import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResenhaModal from '../../src/components/resenha-modal';

jest.mock('../../src/services/resenhas', () => ({
  resenhasService: {
    getResenha: jest.fn(),
    createResenha: jest.fn(),
    updateResenha: jest.fn(),
    removeResenha: jest.fn(),
  },
}));

jest.mock('react-toastify', () => ({
  __esModule: true,
  toast: { error: jest.fn(), success: jest.fn() },
}));

const mockOnClose = jest.fn();
const mockOnSuccess = jest.fn();

describe('ResenhaModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza modal de criação', () => {
    render(
      <ResenhaModal isOpen={true} onClose={mockOnClose} bookId="book1" />
    );
    expect(screen.getByText(/Avaliação e resenha do livro/i)).toBeInTheDocument();
    expect(screen.getByText(/Salvar/)).toBeInTheDocument();
  });

  it('chama onClose ao clicar em Voltar', () => {
    render(
      <ResenhaModal isOpen={true} onClose={mockOnClose} bookId="book1" />
    );
    fireEvent.click(screen.getByText(/Voltar/));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('deixa o botão Salvar desabilitado sem avaliação', () => {
    render(
      <ResenhaModal isOpen={true} onClose={mockOnClose} bookId="book1" />
    );
    expect(screen.getByRole('button', { name: /Salvar/ })).toBeDisabled();
  });

  it('salva uma resenha com avaliação', async () => {
    const { resenhasService } = require('@/services/resenhas');
    resenhasService.createResenha = jest.fn().mockResolvedValue({ _id: '1', conteudo: 'abc', avaliacao: 5 });
    render(
      <ResenhaModal isOpen={true} onClose={mockOnClose} bookId="book1" onSuccess={mockOnSuccess} />
    );
    // Seleciona avaliação
    fireEvent.click(screen.getAllByRole('radio')[4]); // 5 estrelas
    fireEvent.change(screen.getByPlaceholderText(/opinião/), { target: { value: 'Muito bom!' } });
    fireEvent.click(screen.getByRole('button', { name: /Salvar/ }));
    await waitFor(() => {
      expect(resenhasService.createResenha).toHaveBeenCalled();
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('edita uma resenha existente', async () => {
    const { resenhasService } = require('@/services/resenhas');
    resenhasService.getResenha = jest.fn().mockResolvedValue({ _id: '1', conteudo: 'abc', avaliacao: 4, spoiler: false });
    resenhasService.updateResenha = jest.fn().mockResolvedValue({ _id: '1', conteudo: 'editado', avaliacao: 5 });
    render(
      <ResenhaModal isOpen={true} onClose={mockOnClose} bookId="book1" resenhaId="1" onSuccess={mockOnSuccess} />
    );
    // Aguarda carregar dados
    await screen.findByDisplayValue('abc');
    fireEvent.click(screen.getAllByRole('radio')[4]); // 5 estrelas
    fireEvent.change(screen.getByPlaceholderText(/opinião/), { target: { value: 'editado' } });
    fireEvent.click(screen.getByRole('button', { name: /Atualizar/ }));
    await waitFor(() => {
      expect(resenhasService.updateResenha).toHaveBeenCalled();
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('exclui uma resenha existente', async () => {
    const { resenhasService } = require('@/services/resenhas');
    resenhasService.getResenha = jest.fn().mockResolvedValue({ _id: '1', conteudo: 'abc', avaliacao: 4, spoiler: false });
    resenhasService.removeResenha = jest.fn().mockResolvedValue({});
    render(
      <ResenhaModal isOpen={true} onClose={mockOnClose} bookId="book1" resenhaId="1" onSuccess={mockOnSuccess} />
    );
    // Aguarda carregar dados
    await screen.findByDisplayValue('abc');
    fireEvent.click(screen.getByRole('button', { name: /Excluir/ }));
    await waitFor(() => {
      expect(resenhasService.removeResenha).toHaveBeenCalled();
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});