import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '../../src/components/searchbar';
import '@testing-library/jest-dom';

jest.mock('../../src/components/icons/SearchIcon', () => ({
  __esModule: true,
  default: function MockSearchIcon() {
    return <svg data-testid="search-icon" />;
  },
}));

describe('SearchBar Component', () => {
  it('should render the input with the correct placeholder', () => {
    render(<SearchBar placeholder="Buscar..." />);
    const inputElement = screen.getByPlaceholderText('Buscar...');
    expect(inputElement).toBeInTheDocument();
  });

  it('should allow the user to type in the search field', async () => {
    const user = userEvent.setup();
    render(<SearchBar placeholder="Buscar..." />);
    const inputElement = screen.getByPlaceholderText('Buscar...');
    await user.type(inputElement, 'livro de fantasia');
    expect(inputElement).toHaveValue('livro de fantasia');
  });

  it('should not allow typing when disabled', async () => {
    const user = userEvent.setup();
    render(<SearchBar placeholder="Buscar..." disabled />);
    const inputElement = screen.getByPlaceholderText('Buscar...');
    expect(inputElement).toBeDisabled();
    await user.type(inputElement, 'teste');
    expect(inputElement).toHaveValue('');
  });

  it('should apply custom CSS classes', () => {
    render(<SearchBar placeholder="Buscar..." className="minha-classe-extra" />);
    const containerElement = screen.getByPlaceholderText('Buscar...').parentElement;
    expect(containerElement).toHaveClass('minha-classe-extra');
  });

  it('should call the onChange function when typing', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(<SearchBar placeholder="Buscar..." onChange={handleChange} />);
    const inputElement = screen.getByPlaceholderText('Buscar...');
    await user.type(inputElement, 'React');
    expect(handleChange).toHaveBeenCalledTimes(5);
  });

  it('should accept numbers and special characters', async () => {
    const user = userEvent.setup();
    const testString = 'Livro-123!@#$% & Acentuação';
    render(<SearchBar placeholder="Buscar..." />);
    const inputElement = screen.getByPlaceholderText('Buscar...');
    await user.type(inputElement, testString);
    expect(inputElement).toHaveValue(testString);
  });

  // Size tests
  describe('Sizes', () => {
    it('should apply small size styles', () => {
      render(<SearchBar inputSize="small" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('text-b3 small-box');
    });

    it('should apply medium size styles by default', () => {
      render(<SearchBar />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('text-b2 medium-box');
    });

    it('should apply large size styles', () => {
      render(<SearchBar inputSize="large" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('text-b1 large-box');
    });
  });
});