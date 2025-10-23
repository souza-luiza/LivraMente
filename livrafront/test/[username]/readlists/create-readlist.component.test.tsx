import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateReadlist } from '@/components/create-readlist';

describe('CreateReadlist component', () => {
    it('shows validation error when submitting empty title', async () => {
        const onCreate = jest.fn();
        render(<CreateReadlist open={true} onClose={() => {}} onCreate={onCreate} />);
        const submit = screen.getByRole('button', { name: /confirmar/i });
        await userEvent.click(submit);
        const alert = await screen.findByRole('alert');
        expect(alert).toHaveTextContent(/título/i);
    });

    it('shows validation error when submitting long description', async () => {
        const onCreate = jest.fn();
        render(<CreateReadlist open={true} onClose={() => {}} onCreate={onCreate} />);
        const nomeInput = screen.getByPlaceholderText(/Nome da readlist/i);
        await userEvent.type(nomeInput, 'Minha Readlist');
        const descricaoInput = screen.getByLabelText(/Descrição/i);
        const longDesc = 'a'.repeat(501);
        fireEvent.change(descricaoInput, { target: { value: longDesc } });
        const submit = screen.getByRole('button', { name: /confirmar/i });
        await userEvent.click(submit);
        const alerts = await screen.findAllByRole('alert');
        const hasDescError = alerts.some(a =>
            /descrição|Descrição deve ter no máximo/i.test(a.textContent || '')
        );
        expect(hasDescError).toBe(true);
    });

    it('calls onCreate with values when valid', async () => {
        const onCreate = jest.fn().mockResolvedValue(undefined);
        render(<CreateReadlist open={true} onClose={() => {}} onCreate={onCreate} />);
        const input = screen.getByPlaceholderText(/Nome da readlist/i);
        await userEvent.type(input, 'Minha');
        const submit = screen.getByRole('button', { name: /confirmar/i });
        await userEvent.click(submit);
        expect(onCreate).toHaveBeenCalled();
    });
});