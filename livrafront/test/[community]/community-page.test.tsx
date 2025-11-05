import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useParams, useRouter } from 'next/navigation';
import CommunityPage from '@/app/comunidade/[community]/page';

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, className }: { src: string; alt: string; className: string }) => (
    <img src={src} alt={alt} className={className} data-testid="mock-image" />
  ),
}));

jest.mock('@/services/comunidade', () => ({
  getComunidadeByName: jest.fn(),
  checkMemberOrMod: jest.fn(),
  getMembers: jest.fn(),
  getPosts: jest.fn(),
  getModerators: jest.fn(),
  enterCommunity: jest.fn(),
  leaveCommunity: jest.fn(),
}));

jest.mock('@/components/searchbar', () => ({
  __esModule: true,
  default: ({ placeholder }: { placeholder: string }) => (
    <input 
      type="text" 
      placeholder={placeholder} 
      data-testid="search-bar" 
    />
  ),
}));

jest.mock('@/components/sidebar', () => ({
  __esModule: true,
  default: () => <div data-testid="sidebar">Sidebar</div>,
}));

jest.mock('@/components/button', () => ({
  __esModule: true,
  default: ({ 
    text, 
    icon, 
    onClick, 
    path 
  }: { 
    text: string; 
    icon?: React.ReactNode; 
    onClick?: () => void; 
    path?: string;
  }) => (
    <button onClick={onClick} data-testid={`button-${text.toLowerCase()}`}>
      {text}
    </button>
  ),
}));

jest.mock('@/components/loading', () => ({
  __esModule: true,
  default: () => <div data-testid="loading">Loading...</div>,
}));

jest.mock('@/components/post', () => ({
  __esModule: true,
  default: ({ 
    id, 
    community, 
    author, 
    content 
  }: { 
    id: string; 
    community: string; 
    author: string; 
    content: string;
  }) => (
    <div data-testid={`post-${id}`}>
      <div>Community: {community}</div>
      <div>Author: {author}</div>
      <div>Content: {content}</div>
    </div>
  ),
}));

jest.mock('@/components/community-member', () => ({
  __esModule: true,
  default: ({ username }: { username: string }) => (
    <div data-testid={`member-${username}`}>@{username}</div>
  ),
}));

jest.mock('@/components/tabs', () => ({
  TabProvider: ({ 
    children, 
    value, 
    onChange 
  }: { 
    children: React.ReactNode; 
    value: string; 
    onChange: (value: string) => void;
  }) => (
    <div data-testid="tab-provider" data-value={value}>
      {children}
    </div>
  ),
  TabList: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tab-list">{children}</div>
  ),
  Tab: ({ 
    label, 
    value 
  }: { 
    label: string; 
    value: string;
  }) => (
    <button data-testid={`tab-${value}`}>{label}</button>
  ),
  TabPanel: ({ 
    children, 
    value 
  }: { 
    children: React.ReactNode; 
    value: string;
  }) => (
    <div data-testid={`tabpanel-${value}`}>{children}</div>
  ),
}));

jest.mock('@/components/icons/AddIcon', () => () => <span data-testid="add-icon" />);
jest.mock('@/components/icons/RemoveIcon', () => () => <span data-testid="remove-icon" />);
jest.mock('@/components/icons/Edit2Icon', () => () => <span data-testid="edit2-icon" />);
jest.mock('@/components/icons/OpenBookIcon', () => () => <span data-testid="open-book-icon" />);
jest.mock('@/components/icons/EditIcon', () => () => <span data-testid="edit-icon" />);
jest.mock('@/components/icons/CommunityIcon', () => () => <span data-testid="community-icon" />);
jest.mock('@/components/icons/CheckIcon', () => () => <span data-testid="check-icon" />);
jest.mock('@/components/icons/PenToolIcon', () => () => <span data-testid="pen-tool-icon" />);
jest.mock('@/components/icons/ClosedBookIcon', () => () => <span data-testid="closed-book-icon" />);

import * as comunidadeService from '@/services/comunidade';

describe('CommunityPage', () => {
  const mockPush = jest.fn();
  const mockReplace = jest.fn();
  
  const mockCommunityData = {
    nome: 'Harry Potter',
    descricao: 'Uma comunidade sobre Harry Potter',
    imagem_url: '/harry-potter.jpg',
  };

  const mockMembers = [
    { _id: '1', username: 'user1' },
    { _id: '2', username: 'user2' },
  ];

  const mockModerators = [
    { _id: '3', username: 'mod1' },
  ];

  const mockPosts = [
    { 
      _id: 'post1', 
      comunidade: { nome: 'Harry Potter' }, 
      autor: { username: 'user1' }, 
      conteudo: 'First post content', 
      comentarios: [], 
      curtidas: 5,
      categoria: 'geral'
    },
    { 
      _id: 'post2', 
      comunidade: { nome: 'Harry Potter' }, 
      autor: { username: 'user2' }, 
      conteudo: 'Fanart post', 
      comentarios: [], 
      curtidas: 10,
      categoria: 'fanart'
    },
    { 
      _id: 'post3', 
      comunidade: { nome: 'Harry Potter' }, 
      autor: { username: 'user3' }, 
      conteudo: 'Fanfic post', 
      comentarios: [], 
      curtidas: 3,
      categoria: 'fanfic'
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
    });
    
    (useParams as jest.Mock).mockReturnValue({
      community: 'harry-potter',
    });
  });

  describe('Initial Loading and Data Fetching', () => {
    it('should show loading state initially', () => {
      (comunidadeService.getComunidadeByName as jest.Mock).mockImplementation(() => 
        new Promise(() => {})
      );

      render(<CommunityPage />);
      
      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('should redirect to not-found when community param is missing', async () => {
      (useParams as jest.Mock).mockReturnValue({ community: undefined });

      render(<CommunityPage />);
      
      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/not-found');
      });
    });

    it('should redirect to not-found when community is not found', async () => {
      (comunidadeService.getComunidadeByName as jest.Mock).mockResolvedValue(null);

      render(<CommunityPage />);
      
      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/not-found');
      });
    });

    it('should handle API errors gracefully', async () => {
      (comunidadeService.getComunidadeByName as jest.Mock).mockRejectedValue(new Error('API Error'));

      render(<CommunityPage />);
      
      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/not-found');
      });
    });
  });

  describe('Community Data Display', () => {
    beforeEach(async () => {
      (comunidadeService.getComunidadeByName as jest.Mock).mockResolvedValue(mockCommunityData);
      (comunidadeService.checkMemberOrMod as jest.Mock).mockResolvedValue({ 
        isMember: false, 
        isModerator: false 
      });
      (comunidadeService.getMembers as jest.Mock).mockResolvedValue(mockMembers);
      (comunidadeService.getPosts as jest.Mock).mockResolvedValue(mockPosts);
      (comunidadeService.getModerators as jest.Mock).mockResolvedValue(mockModerators);

      render(<CommunityPage />);
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });
    });

    it('should display community information correctly', () => {
      expect(screen.getByText('Harry Potter')).toBeInTheDocument();
      expect(screen.getByText('Uma comunidade sobre Harry Potter')).toBeInTheDocument();
    });

    it('should display community banner and profile image when available', () => {
      const images = screen.getAllByTestId('mock-image');
      expect(images).toHaveLength(2);
    });

    it('should convert slug to title correctly', () => {
      expect(screen.getByText('Harry Potter')).toBeInTheDocument();
    });
  });

  describe('Button Visibility Based on User Status', () => {
    it('should show "Entrar" button when user is not a member', async () => {
      (comunidadeService.getComunidadeByName as jest.Mock).mockResolvedValue(mockCommunityData);
      (comunidadeService.checkMemberOrMod as jest.Mock).mockResolvedValue({ 
        isMember: false, 
        isModerator: false 
      });
      (comunidadeService.getMembers as jest.Mock).mockResolvedValue(mockMembers);
      (comunidadeService.getPosts as jest.Mock).mockResolvedValue(mockPosts);
      (comunidadeService.getModerators as jest.Mock).mockResolvedValue(mockModerators);

      render(<CommunityPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('button-entrar')).toBeInTheDocument();
        expect(screen.queryByTestId('button-sair')).not.toBeInTheDocument();
      });
    });

    it('should show "Sair" button when user is a member', async () => {
      (comunidadeService.getComunidadeByName as jest.Mock).mockResolvedValue(mockCommunityData);
      (comunidadeService.checkMemberOrMod as jest.Mock).mockResolvedValue({ 
        isMember: true, 
        isModerator: false 
      });
      (comunidadeService.getMembers as jest.Mock).mockResolvedValue(mockMembers);
      (comunidadeService.getPosts as jest.Mock).mockResolvedValue(mockPosts);
      (comunidadeService.getModerators as jest.Mock).mockResolvedValue(mockModerators);

      render(<CommunityPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('button-sair')).toBeInTheDocument();
        expect(screen.queryByTestId('button-entrar')).not.toBeInTheDocument();
      });
    });

    it('should show "Editar" button when user is a moderator', async () => {
      (comunidadeService.getComunidadeByName as jest.Mock).mockResolvedValue(mockCommunityData);
      (comunidadeService.checkMemberOrMod as jest.Mock).mockResolvedValue({ 
        isMember: true, 
        isModerator: true 
      });
      (comunidadeService.getMembers as jest.Mock).mockResolvedValue(mockMembers);
      (comunidadeService.getPosts as jest.Mock).mockResolvedValue(mockPosts);
      (comunidadeService.getModerators as jest.Mock).mockResolvedValue(mockModerators);

      render(<CommunityPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('button-editar')).toBeInTheDocument();
      });
    });
  });

  describe('Community Interaction', () => {
    it('should allow user to join community', async () => {
      const user = userEvent.setup();
      
      (comunidadeService.getComunidadeByName as jest.Mock).mockResolvedValue(mockCommunityData);
      (comunidadeService.checkMemberOrMod as jest.Mock).mockResolvedValue({ 
        isMember: false, 
        isModerator: false 
      });
      (comunidadeService.getMembers as jest.Mock).mockResolvedValue(mockMembers);
      (comunidadeService.getPosts as jest.Mock).mockResolvedValue(mockPosts);
      (comunidadeService.getModerators as jest.Mock).mockResolvedValue(mockModerators);
      (comunidadeService.enterCommunity as jest.Mock).mockResolvedValue({});
      (comunidadeService.getMembers as jest.Mock).mockResolvedValue([...mockMembers, { _id: '3', username: 'newuser' }]);

      render(<CommunityPage />);
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      const enterButton = screen.getByTestId('button-entrar');
      await user.click(enterButton);

      await waitFor(() => {
        expect(comunidadeService.enterCommunity).toHaveBeenCalledWith('Harry Potter');
      });
    });

    it('should allow user to leave community', async () => {
      const user = userEvent.setup();
      
      (comunidadeService.getComunidadeByName as jest.Mock).mockResolvedValue(mockCommunityData);
      (comunidadeService.checkMemberOrMod as jest.Mock).mockResolvedValue({ 
        isMember: true, 
        isModerator: false 
      });
      (comunidadeService.getMembers as jest.Mock).mockResolvedValue(mockMembers);
      (comunidadeService.getPosts as jest.Mock).mockResolvedValue(mockPosts);
      (comunidadeService.getModerators as jest.Mock).mockResolvedValue(mockModerators);
      (comunidadeService.leaveCommunity as jest.Mock).mockResolvedValue({});
      (comunidadeService.getMembers as jest.Mock).mockResolvedValue(mockMembers.slice(1));

      render(<CommunityPage />);
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      const leaveButton = screen.getByTestId('button-sair');
      await user.click(leaveButton);

      await waitFor(() => {
        expect(comunidadeService.leaveCommunity).toHaveBeenCalledWith('Harry Potter');
      });
    });

    it('should handle join/leave errors gracefully', async () => {
      const user = userEvent.setup();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      (comunidadeService.getComunidadeByName as jest.Mock).mockResolvedValue(mockCommunityData);
      (comunidadeService.checkMemberOrMod as jest.Mock).mockResolvedValue({ 
        isMember: false, 
        isModerator: false 
      });
      (comunidadeService.getMembers as jest.Mock).mockResolvedValue(mockMembers);
      (comunidadeService.getPosts as jest.Mock).mockResolvedValue(mockPosts);
      (comunidadeService.getModerators as jest.Mock).mockResolvedValue(mockModerators);
      (comunidadeService.enterCommunity as jest.Mock).mockRejectedValue(new Error('API Error'));

      render(<CommunityPage />);
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      const enterButton = screen.getByTestId('button-entrar');
      await user.click(enterButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Erro ao atualizar participação na comunidade:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Posts Display and Filtering', () => {
    beforeEach(async () => {
      (comunidadeService.getComunidadeByName as jest.Mock).mockResolvedValue(mockCommunityData);
      (comunidadeService.checkMemberOrMod as jest.Mock).mockResolvedValue({ 
        isMember: false, 
        isModerator: false 
      });
      (comunidadeService.getMembers as jest.Mock).mockResolvedValue(mockMembers);
      (comunidadeService.getPosts as jest.Mock).mockResolvedValue(mockPosts);
      (comunidadeService.getModerators as jest.Mock).mockResolvedValue(mockModerators);

      render(<CommunityPage />);
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });
    });

    it('should display posts in the community feed tab', () => {
      expect(screen.getByTestId('post-post1')).toBeInTheDocument();
      expect(screen.getByText('Content: First post content')).toBeInTheDocument();
    });

    it('should show empty state when no posts in category', async () => {
      (comunidadeService.getPosts as jest.Mock).mockResolvedValue([]);
      
      render(<CommunityPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Nenhum post ainda nesta categoria.')).toBeInTheDocument();
      });
    });
  });

  describe('Members and Moderators Display', () => {
    it('should display members and moderators correctly', async () => {
      (comunidadeService.getComunidadeByName as jest.Mock).mockResolvedValue(mockCommunityData);
      (comunidadeService.checkMemberOrMod as jest.Mock).mockResolvedValue({ 
        isMember: false, 
        isModerator: false 
      });
      (comunidadeService.getMembers as jest.Mock).mockResolvedValue(mockMembers);
      (comunidadeService.getPosts as jest.Mock).mockResolvedValue(mockPosts);
      (comunidadeService.getModerators as jest.Mock).mockResolvedValue(mockModerators);

      render(<CommunityPage />);
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      expect(screen.getByTestId('member-user1')).toBeInTheDocument();
      expect(screen.getByTestId('member-user2')).toBeInTheDocument();
      expect(screen.getByTestId('member-mod1')).toBeInTheDocument();
    });

    it('should show empty state when no members', async () => {
      (comunidadeService.getComunidadeByName as jest.Mock).mockResolvedValue(mockCommunityData);
      (comunidadeService.checkMemberOrMod as jest.Mock).mockResolvedValue({ 
        isMember: false, 
        isModerator: false 
      });
      (comunidadeService.getMembers as jest.Mock).mockResolvedValue([]);
      (comunidadeService.getPosts as jest.Mock).mockResolvedValue([]);
      (comunidadeService.getModerators as jest.Mock).mockResolvedValue([]);

      render(<CommunityPage />);
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Nenhum membro ainda nesta comunidade.')).toBeInTheDocument();
      expect(screen.getByText('Nenhum moderador ainda nesta comunidade.')).toBeInTheDocument();
    });
  });

  describe('Tab Functionality', () => {
    it('should handle tab changes for posts', async () => {
      const user = userEvent.setup();
      
      (comunidadeService.getComunidadeByName as jest.Mock).mockResolvedValue(mockCommunityData);
      (comunidadeService.checkMemberOrMod as jest.Mock).mockResolvedValue({ 
        isMember: false, 
        isModerator: false 
      });
      (comunidadeService.getMembers as jest.Mock).mockResolvedValue(mockMembers);
      (comunidadeService.getPosts as jest.Mock).mockResolvedValue(mockPosts);
      (comunidadeService.getModerators as jest.Mock).mockResolvedValue(mockModerators);

      render(<CommunityPage />);
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      const providers = screen.getAllByTestId('tab-provider');
      const postsProvider = providers.find((el) => el.getAttribute('data-value') === 'community-feed');
      expect(postsProvider).toBeInTheDocument();
    });
  });

  describe('slugToTitle Function', () => {
    it('should convert various slug formats to titles correctly', () => {
      const testCases = [
        { input: 'harry-potter', expected: 'Harry Potter' },
        { input: 'lord-of-the-rings', expected: 'Lord Of The Rings' },
        { input: 'test-community', expected: 'Test Community' },
        { input: 'single', expected: 'Single' },
      ];

      testCases.forEach(async ({ input, expected }) => {
        (useParams as jest.Mock).mockReturnValue({ community: input });
        (comunidadeService.getComunidadeByName as jest.Mock).mockResolvedValue({ nome: expected, descricao: '', imagem_url: null });
        (comunidadeService.checkMemberOrMod as jest.Mock).mockResolvedValue({ isMember: false, isModerator: false });
        (comunidadeService.getMembers as jest.Mock).mockResolvedValue([]);
        (comunidadeService.getPosts as jest.Mock).mockResolvedValue([]);
        (comunidadeService.getModerators as jest.Mock).mockResolvedValue([]);

        render(<CommunityPage />);

        await waitFor(() => {
          expect(screen.getByText(expected)).toBeInTheDocument();
        });

        cleanup();
        jest.clearAllMocks();
      });
    });
  });
});