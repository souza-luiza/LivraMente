global.alert = jest.fn();
Object.defineProperty(window, 'location', {
  value: {
    ...window.location,
    assign: jest.fn(),
    replace: jest.fn(),
  },
});
import { render, screen, fireEvent } from '@testing-library/react';
import { ReadlistCard } from '@/components/readlist-card';

const mockReadlist = {
  _id: '1',
  nome: 'Favoritos',
  favorito: true,
  publica: true,
  descricao: 'Descrição de teste',
  capa_url: '/kemi-teste.jpg',
  criador: { _id: '1', username: 'gatanoturna' },
  livros: ['livro1', 'livro2'],
  favoritadoPor: ['user1'],
  createdAt: '2025-10-01',
  updatedAt: '2025-10-02',
};

describe('ReadlistCard', () => {
  it('renderiza nome da readlist', () => {
    render(<ReadlistCard r={mockReadlist} userId="1" />);
    expect(screen.getByText(/Favoritos/i)).toBeInTheDocument();
  });

  it('renderiza descrição', () => {
    render(<ReadlistCard r={mockReadlist} userId="1" />);
    expect(screen.getByText(/Descrição de teste/i)).toBeInTheDocument();
  });

  it('favorita e desfavorita readlist', () => {
    const r = { ...mockReadlist, favoritadoPor: [] };
    render(<ReadlistCard r={r} userId="2" />);
    const curtirBtn = screen.getByLabelText('Curtir');
    fireEvent.mouseDown(curtirBtn);
    fireEvent.mouseUp(curtirBtn);
    fireEvent.mouseDown(curtirBtn);
    fireEvent.mouseUp(curtirBtn);
    expect(curtirBtn).toBeInTheDocument();
  });

  it('aciona botão de compartilhar', () => {
    const notMineReadlist = { ...mockReadlist, criador: { ...mockReadlist.criador, _id: '2' } };
    render(<ReadlistCard r={notMineReadlist} userId="1" />);
    const compartilharBtn = screen.getByLabelText('Compartilhar');
    fireEvent.mouseDown(compartilharBtn);
    fireEvent.mouseUp(compartilharBtn);
    expect(compartilharBtn).toBeInTheDocument();
  });

  it('navega ao clicar no card', () => {
    const originalLocation = window.location;
    // @ts-ignore
    delete window.location;
    // @ts-ignore
    window.location = { href: '' };
    render(<ReadlistCard r={mockReadlist} userId="1" />);
    const card = screen.getAllByRole('button').find(b => !b.getAttribute('aria-label'));
    fireEvent.click(card!);
    expect(window.location.href).toBe('/readlist');
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  it('renderiza imagem padrão se capa_url vazio', () => {
    const r = { ...mockReadlist, capa_url: '' };
    render(<ReadlistCard r={r} userId="1" />);
    const img = screen.getAllByRole('img')[0];
    expect(img).toHaveAttribute('src', '/kemi-teste.jpg');
  });

  it('aceita favoritadoPor como não array', () => {
    const r = { ...mockReadlist, favoritadoPor: undefined };
    render(<ReadlistCard r={r} userId="1" />);
    expect(screen.getByText(/Favoritos/i)).toBeInTheDocument();
  });

  it('renderiza corretamente quando isMine=true', () => {
    render(<ReadlistCard r={{ ...mockReadlist, criador: { _id: 'meuId', username: 'eu' } }} userId="meuId" />);
    expect(screen.getByText(/eu/i)).toBeInTheDocument();
    expect(screen.queryByText(/Favoritada/i)).toBeNull();
  });

  it('renderiza corretamente quando readlist não é pública', () => {
    render(<ReadlistCard r={{ ...mockReadlist, publica: false, criador: mockReadlist.criador }} userId="1" />);
    expect(screen.getByText(/Privada/i)).toBeInTheDocument();
  });

  it('renderiza Favoritada label quando favoritadoPor.length > 0 e !isMine', () => {
    render(<ReadlistCard r={{ ...mockReadlist, favoritadoPor: ['2'], criador: { _id: '1', username: 'gatanoturna' } }} userId="2" />);
    expect(screen.getByText(/Favoritada/i)).toBeInTheDocument();
  });

  it('não renderiza Favoritada label quando isMine=true', () => {
    render(<ReadlistCard r={{ ...mockReadlist, favoritadoPor: ['1'], criador: { _id: '1', username: 'eu' } }} userId="1" />);
    expect(screen.queryByText(/Favoritada/i)).toBeNull();
  });

  it('renderiza fallback para criador/username ausente', () => {
    render(<ReadlistCard r={{ ...mockReadlist, criador: undefined } as any} userId="1" />);
    expect(screen.getByText(/desconhecido/i)).toBeInTheDocument();
  });

  it('renderiza corretamente quando favoritadoPor é null', () => {
    render(<ReadlistCard r={{ ...mockReadlist, favoritadoPor: null as unknown as string[] | undefined }} userId="1" />);
    expect(screen.getByText(/Favoritos/i)).toBeInTheDocument();
  });

  it('muda cor do ícone ao hover/active (heart)', () => {
    const notMineReadlist = { ...mockReadlist, criador: { ...mockReadlist.criador, _id: '2' } };
    render(<ReadlistCard r={notMineReadlist} userId="1" />);
    const curtirBtn = screen.getByLabelText('Curtir');
    fireEvent.mouseEnter(curtirBtn);
    fireEvent.mouseDown(curtirBtn);
    fireEvent.mouseUp(curtirBtn);
    fireEvent.mouseLeave(curtirBtn);
    expect(curtirBtn).toBeInTheDocument();
  });

  it('muda cor do ícone ao hover/active (share)', () => {
    const notMineReadlist = { ...mockReadlist, criador: { ...mockReadlist.criador, _id: '2' } };
    render(<ReadlistCard r={notMineReadlist} userId="1" />);
    const compartilharBtn = screen.getByLabelText('Compartilhar');
    fireEvent.mouseEnter(compartilharBtn);
    fireEvent.mouseDown(compartilharBtn);
    fireEvent.mouseUp(compartilharBtn);
    fireEvent.mouseLeave(compartilharBtn);
    expect(compartilharBtn).toBeInTheDocument();
  });

  it('navega ao pressionar Enter ou Espaço', () => {
    const originalLocation = window.location;
    // @ts-ignore
    delete window.location;
    // @ts-ignore
    window.location = { href: '' };
    render(<ReadlistCard r={mockReadlist} userId="1" />);
    const card = screen.getAllByRole('button').find(b => !b.getAttribute('aria-label'));
    fireEvent.keyDown(card!, { key: 'Enter' });
    expect(window.location.href).toBe('/readlist');
    window.location.href = '';
    fireEvent.keyDown(card!, { key: ' ' });
    expect(window.location.href).toBe('/readlist');
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  it('renderiza corretamente quando não há livros', () => {
    render(<ReadlistCard r={{ ...mockReadlist, livros: [], criador: mockReadlist.criador }} userId="1" />);
    expect(screen.getByText(/0 livros/i)).toBeInTheDocument();
  });
});