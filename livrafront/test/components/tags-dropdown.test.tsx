import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TagsDropdown from '@/components/tags-dropdown';

describe('TagsDropdown', () => {
    it('exibe placeholder quando nenhuma tag está selecionada', () => {
        const setTags = jest.fn();
        render(<TagsDropdown selectedTags={[]} setSelectedTags={setTags} placeholder="Selecione gêneros da comunidade" />);
        const btn = screen.getByRole('button', { name: 'Tags da comunidade' });
        expect(btn).toBeInTheDocument();
        expect(btn).toHaveTextContent('Selecione gêneros da comunidade');
    });

    it('exibe tags selecionadas', () => {
        const setTags = jest.fn();
        render(<TagsDropdown selectedTags={['Romance', 'Aventura']} setSelectedTags={setTags} />);
        const btn = screen.getByRole('button', { name: 'Tags da comunidade' });
        expect(btn).toHaveTextContent('Romance');
        expect(btn).toHaveTextContent('Aventura');
    });

    it('abre o dropdown e alterna uma tag ao clicar', () => {
        const setTags = jest.fn();
        render(<TagsDropdown selectedTags={[]} setSelectedTags={setTags} />);
        const btn = screen.getByRole('button', { name: 'Tags da comunidade' });
        fireEvent.click(btn);
        const romanceCheckbox = screen.getByRole('checkbox', { name: 'Romance' });
        expect(romanceCheckbox).toBeInTheDocument();
        fireEvent.click(romanceCheckbox);
        expect(setTags).toHaveBeenCalledWith(['Romance']);
    });

    it('abre com Enter do teclado', () => {
        const setTags = jest.fn();
        render(<TagsDropdown selectedTags={[]} setSelectedTags={setTags} />);
        const btn = screen.getByRole('button', { name: 'Tags da comunidade' });
        expect(btn).toHaveAttribute('aria-expanded');
        fireEvent.keyDown(btn, { key: 'Enter', code: 'Enter' });
        expect(screen.getByRole('checkbox', { name: 'Fantasia' })).toBeInTheDocument();
    });

    it('fecha ao clicar fora', () => {
        const setTags = jest.fn();
        const { container } = render(<div>
            <TagsDropdown selectedTags={[]} setSelectedTags={setTags} />
            <button data-testid="outside">outside</button>
        </div>);
        const btn = screen.getByRole('button', { name: 'Tags da comunidade' });
        fireEvent.click(btn);
        expect(screen.getByRole('checkbox', { name: 'Romance' })).toBeInTheDocument();
        const outside = screen.getByTestId('outside');
        fireEvent.mouseDown(outside);
        expect(container.querySelector('input[type="checkbox"]')).toBeNull();
    });
});