
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ReadlistsPage from '../../src/app/[username]/readlists/page';
import { useReadlistsList } from '../../src/hooks/useReadlistsList';

jest.mock('../../src/hooks/useReadlistsList');
const mockUseReadlistsList = useReadlistsList as jest.Mock;

jest.mock('next/navigation', () => ({
	useParams: () => ({ username: '1' })
}));

describe('ReadlistsPage', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		Object.defineProperty(window, 'localStorage', {
			value: { getItem: () => '1' },
			writable: true,
		});
		Object.defineProperty(window, 'location', {
			value: { search: '' },
			writable: true,
		});
	});

	it('falls back to Usuário if username fetch fails', async () => {
		Object.defineProperty(window, 'location', {
			value: { search: '?userId=2' },
			writable: true,
		});
		global.fetch = jest.fn((url) => {
			if (url.includes('/api/users/2')) {
				return Promise.reject('fail');
			}
			return Promise.resolve(new Response(JSON.stringify([]), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			}));
		}) as jest.Mock;
		mockUseReadlistsList.mockReturnValue({ readlists: [], loading: false, error: null });
		render(<ReadlistsPage />);
		await waitFor(() => {
			expect(screen.getByText(/Readlists de Usuário/i)).toBeInTheDocument();
		});
	});

	it('falls back to empty array if favorited fetch fails', async () => {
		mockUseReadlistsList.mockReturnValue({ readlists: [], loading: false, error: null });
		global.fetch = jest.fn(() => Promise.reject('fail')) as jest.Mock;
		await act(async () => {
			render(<ReadlistsPage />);
		});
		const favoritasBtn = screen.getByRole('button', { name: /favoritadas/i });
		await act(async () => {
			fireEvent.click(favoritasBtn);
		});
		await waitFor(() => {
			expect(screen.getByText(/Nenhuma readlist encontrada/i)).toBeInTheDocument();
		});
	});

	it('does not change pageUserId if userId in search equals loggedUserId', async () => {
		Object.defineProperty(window, 'location', {
			value: { search: '?userId=1' },
			writable: true,
		});
		mockUseReadlistsList.mockReturnValue({ readlists: [], loading: false, error: null });
		render(<ReadlistsPage />);
		expect(screen.getByText(/Minhas readlists/i)).toBeInTheDocument();
	});

	it('shows empty state if only private readlists for other user', async () => {
		Object.defineProperty(window, 'location', {
			value: { search: '?userId=2' },
			writable: true,
		});
		global.fetch = jest.fn((url) => {
			if (url.includes('/api/users/2')) {
				return Promise.resolve(new Response(JSON.stringify({ username: 'otherUser' }), {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				}));
			}
			return Promise.resolve(new Response(JSON.stringify([]), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			}));
		}) as jest.Mock;
		mockUseReadlistsList.mockReturnValue({
			readlists: [
				{ _id: '1', nome: 'Privada', criador: { _id: '2', username: 'otherUser' }, livros: [], favoritadoPor: [], publica: false, descricao: '', createdAt: '' },
			],
			loading: false,
			error: null,
		});
		render(<ReadlistsPage />);
		await waitFor(() => {
			expect(screen.getByText(/Nenhuma readlist encontrada/i)).toBeInTheDocument();
		});
	});

	it('navigates when Voltar link is clicked', async () => {
		Object.defineProperty(window, 'location', {
			value: { search: '?userId=2' },
			writable: true,
		});
		global.fetch = jest.fn((url) => {
			if (url.includes('/api/users/2')) {
				return Promise.resolve(new Response(JSON.stringify({ username: 'john_doe' }), {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				}));
			}
			return Promise.resolve(new Response(JSON.stringify([]), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			}));
		}) as jest.Mock;
		mockUseReadlistsList.mockReturnValue({ readlists: [], loading: false, error: null });
		render(<ReadlistsPage />);
		await waitFor(() => {
			const voltarLink = screen.getByLabelText('Voltar');
			expect(voltarLink).toBeInTheDocument();
			expect(voltarLink.getAttribute('href')).toBe('/john_doe');
		});
	});

	it('renders many readlists and edge-case data', async () => {
		const longName = 'A'.repeat(100);
		mockUseReadlistsList.mockReturnValue({
			readlists: Array.from({ length: 20 }, (_, i) => ({
				_id: String(i),
				nome: i === 0 ? longName : `Readlist ${i}`,
				criador: { _id: '1', username: 'me' },
				livros: [],
				favoritadoPor: [],
				publica: true,
				descricao: '',
				createdAt: '',
			})),
			loading: false,
			error: null,
		});
		await act(async () => {
			render(<ReadlistsPage />);
		});
		expect(screen.getAllByText(/Readlist/).length).toBeGreaterThan(10);
		expect(screen.getByText(longName)).toBeInTheDocument();
	});

		it('renders own page: title, create button, tabs, public/private readlists', async () => {
			mockUseReadlistsList.mockReturnValue({
				readlists: [
					{ _id: '1', nome: 'Readlist Pública', criador: { _id: '1', username: 'me' }, livros: [], favoritadoPor: [], publica: true, descricao: '', createdAt: '' },
					{ _id: '2', nome: 'Readlist Privada', criador: { _id: '1', username: 'me' }, livros: [], favoritadoPor: [], publica: false, descricao: '', createdAt: '' },
				],
				loading: false,
				error: null,
			});
			await act(async () => {
				render(<ReadlistsPage />);
			});
			expect(screen.getByText(/Minhas readlists/i)).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /criar readlist/i })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /favoritadas/i })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /criadas por mim/i })).toBeInTheDocument();
			expect(screen.getAllByText(/Pública/i).length).toBeGreaterThan(0);
			expect(screen.getAllByText(/Privada/i).length).toBeGreaterThan(0);
		});

		it('renders other user page: title, only public readlists, no create button/tabs', async () => {
			Object.defineProperty(window, 'location', {
				value: { search: '?userId=2' },
				writable: true,
			});
			global.fetch = jest.fn((url) => {
				if (url.includes('/api/users/2')) {
					return Promise.resolve(new Response(JSON.stringify({ username: 'otherUser' }), {
						status: 200,
						headers: { 'Content-Type': 'application/json' },
					}));
				}
				return Promise.resolve(new Response(JSON.stringify([]), {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				}));
			}) as jest.Mock;
			mockUseReadlistsList.mockReturnValue({
				readlists: [
					{ _id: '1', nome: 'Privada', criador: { _id: '2', username: 'otherUser' }, livros: [], favoritadoPor: [], publica: false, descricao: '', createdAt: '' },
					{ _id: '2', nome: 'Pública', criador: { _id: '2', username: 'otherUser' }, livros: [], favoritadoPor: [], publica: true, descricao: '', createdAt: '' },
				],
				loading: false,
				error: null,
			});
			render(<ReadlistsPage />);
			await waitFor(() => {
				expect(screen.getByText(/Readlists de otherUser/i)).toBeInTheDocument();
				expect(screen.queryByRole('button', { name: /criar readlist/i })).toBeNull();
				expect(screen.queryByRole('button', { name: /favoritadas/i })).toBeNull();
				expect(screen.queryByRole('button', { name: /criadas por mim/i })).toBeNull();
				expect(screen.getAllByText(/Pública/i).length).toBeGreaterThan(0);
				expect(screen.queryByText(/Privada/i)).toBeNull();
			});
		});

		it('opens and closes create modal', async () => {
			mockUseReadlistsList.mockReturnValue({ readlists: [], loading: false, error: null });
			await act(async () => {
				render(<ReadlistsPage />);
			});
			const criarBtn = screen.getByRole('button', { name: /criar readlist/i });
			await act(async () => {
				fireEvent.click(criarBtn);
			});
			expect(screen.getAllByText(/Criar Readlist/i).length).toBeGreaterThan(0);
			fireEvent.click(screen.getByText(/cancelar/i));
			await waitFor(() => {
				expect(screen.queryByRole('dialog')).toBeNull();
			});
		});

	it('shows empty state message', () => {
		mockUseReadlistsList.mockReturnValue({ readlists: [], loading: false, error: null });
		render(<ReadlistsPage />);
		expect(screen.getByText(/Nenhuma readlist encontrada/i)).toBeInTheDocument();
	});

	it('shows error message', () => {
		mockUseReadlistsList.mockReturnValue({ readlists: [], loading: false, error: 'Erro ao carregar readlists' });
		render(<ReadlistsPage />);
		expect(screen.getByText('Erro ao carregar readlists')).toBeInTheDocument();
	});

		it('switches tabs between minhas and favoritadas', async () => {
			mockUseReadlistsList.mockReturnValue({
				readlists: [
					{ _id: '1', nome: 'Minhas', criador: { _id: '1', username: 'eu' }, livros: [], favoritadoPor: [], publica: true, descricao: '', createdAt: '' },
				],
				loading: false,
				error: null,
			});
			await act(async () => {
				render(<ReadlistsPage />);
			});
			expect(screen.getByRole('button', { name: /criadas por mim/i })).toBeInTheDocument();
			const favoritasBtn = screen.getByRole('button', { name: /favoritadas/i });
			await act(async () => {
				fireEvent.click(favoritasBtn);
			});
			await waitFor(() => {
				expect(screen.getAllByText(/Favoritadas/i).length).toBe(1);
			});
		});

		it('renders favorited readlists in Favoritadas tab', async () => {
			mockUseReadlistsList.mockReturnValue({ readlists: [], loading: false, error: null });
			global.fetch = jest.fn(() =>
				Promise.resolve(new Response(JSON.stringify([
					{
						_id: '99',
						nome: 'Favoritada',
						criador: { _id: '2', username: 'outro' },
						livros: [],
						favoritadoPor: ['1'],
						publica: true,
						descricao: '',
						createdAt: '',
					},
				]), {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				}))
			) as jest.Mock;
			await act(async () => {
				render(<ReadlistsPage />);
			});
			const favoritasBtn = screen.getByRole('button', { name: /favoritadas/i });
			await act(async () => {
				fireEvent.click(favoritasBtn);
			});
				await waitFor(() => {
					expect(screen.getAllByText(/Favoritada/i).length).toBeGreaterThan(0);
					// Aceitar 'Pública' ou 'Favoritada' como label
					const publicLabels = screen.queryAllByText((content, element) =>
						/Pública|Favoritada/i.test(content)
					);
					expect(publicLabels.length).toBeGreaterThan(0);
				});
		});
});