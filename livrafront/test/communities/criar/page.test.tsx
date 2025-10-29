import { render, screen, fireEvent } from '@testing-library/react';
import CreateReadlistPage from '@/app/comunidades/criar/page';

beforeAll(() => {
  global.URL.createObjectURL = jest.fn(() => 'mock-url');
});

describe('CreateReadlistPage', () => {
  it('renderiza todos os campos do formulário', () => {
    render(<CreateReadlistPage />);
    expect(screen.getByText('Crie sua nova comunidade')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome da comunidade')).toBeInTheDocument();
    expect(screen.getByLabelText('Descrição da comunidade')).toBeInTheDocument();
    expect(screen.getByLabelText('Tags da comunidade')).toBeInTheDocument();
    expect(screen.getByLabelText('Imagem de capa')).toBeInTheDocument();
    expect(screen.getByText('Upload de capa')).toBeInTheDocument();
    expect(screen.getByText('Criar comunidade')).toBeInTheDocument();
  });

  it('valida campos obrigatórios ao enviar', () => {
    render(<CreateReadlistPage />);
    fireEvent.click(screen.getByText('Criar comunidade'));
    expect(screen.getByText('O nome é obrigatório.')).toBeInTheDocument();
    expect(screen.getByText('A descrição é obrigatória.')).toBeInTheDocument();
    expect(screen.getByText('As tags são obrigatórias.')).toBeInTheDocument();
  });

  it('mostra preview da imagem ao selecionar arquivo', () => {
    render(<CreateReadlistPage />);
    const input = screen.getByLabelText('Imagem de capa');
    const file = new File(['dummy'], 'capa.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });
    expect(screen.getByAltText('Prévia')).toBeInTheDocument();
  });
});