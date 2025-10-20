import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '../../src/components/searchbar';
import '@testing-library/jest-dom';

describe('SearchBar Component', () => {
  test('deve renderizar o input com o placeholder correto', () => {
    render(<SearchBar placeholder="Buscar..." />);
    const inputElement = screen.getByPlaceholderText('Buscar...');
    expect(inputElement).toBeInTheDocument();
  });

  test('deve permitir que o usuário digite no campo de busca', async () => {
    const user = userEvent.setup();
    render(<SearchBar placeholder="Buscar..." />);
    const inputElement = screen.getByPlaceholderText('Buscar...');
    await user.type(inputElement, 'livro de fantasia');
    expect(inputElement).toHaveValue('livro de fantasia');
  });

  test('não deve permitir digitação quando estiver desabilitado', async () => {
    const user = userEvent.setup();
    render(<SearchBar placeholder="Buscar..." disabled />);
    const inputElement = screen.getByPlaceholderText('Buscar...');
    expect(inputElement).toBeDisabled();
    await user.type(inputElement, 'teste');
    expect(inputElement).toHaveValue('');
  });

  test('deve aplicar classes CSS customizadas', () => {
    render(<SearchBar placeholder="Buscar..." className="minha-classe-extra" />);
    const containerElement = screen.getByPlaceholderText('Buscar...').parentElement;
    expect(containerElement).toHaveClass('minha-classe-extra');
  });

jest.mock('../../src/components/icons/SearchIcon', () => ({
  __esModule: true,
  default: function MockSearchIcon() {
    return <svg data-testid="search-icon">Search</svg>
  },
}))

  test('deve chamar a função onChange ao digitar', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(<SearchBar placeholder="Buscar..." onChange={handleChange} />);
    const inputElement = screen.getByPlaceholderText('Buscar...');
    await user.type(inputElement, 'React');
    expect(handleChange).toHaveBeenCalledTimes(5);
  });

  test('deve aceitar números e caracteres especiais', async () => {
    const user = userEvent.setup();
    const testString = 'Livro-123!@#$% & Acentuação';
    render(<SearchBar placeholder="Buscar..." />);
    const inputElement = screen.getByPlaceholderText('Buscar...');
    await user.type(inputElement, testString);
    expect(inputElement).toHaveValue(testString);
  });
});