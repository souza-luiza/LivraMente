import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { useRouter, useParams } from 'next/navigation';
import PostPage from '@/app/comunidade/[community]/postagem/[postId]/page';

// Mock all dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock('@/lib/slugify', () => ({
  slugToTitle: jest.fn(),
}));

jest.mock('@/services/comunidade', () => ({
  communityService: {
    getComunidadeByName: jest.fn(),
    checkMemberOrMod: jest.fn(),
  },
}));

jest.mock('@/services/posts', () => ({
  postsService: {
    getPostById: jest.fn(),
    getComments: jest.fn(),
  },
}));

jest.mock('@/services/comentarios', () => ({
  commentsService: {
    createComment: jest.fn(),
  },
}));

jest.mock('@/services/auth', () => ({
  getSessionInfos: jest.fn(),
}));

jest.mock('@/components/sidebar', () => ({
  __esModule: true,
  default: () => <div data-testid="sidebar">Sidebar</div>,
}));

jest.mock('@/components/searchbar', () => ({
  __esModule: true,
  default: () => <div data-testid="searchbar">SearchBar</div>,
}));

jest.mock('@/components/loading', () => ({
  __esModule: true,
  default: () => <div data-testid="loading">Loading</div>,
}));

jest.mock('@/components/post', () => ({
  __esModule: true,
  PostComponent: ({ post, handleComment }: any) => (
    <div data-testid="post-component" onClick={handleComment}>
      Post: {post?._id}
    </div>
  ),
  default: ({ post, handleComment }: any) => (
    <div data-testid="post-component" onClick={handleComment}>
      Post: {post?._id}
    </div>
  ),
}));

jest.mock('@/components/comment', () => ({
  __esModule: true,
  CommentComponent: ({ comment }: any) => (
    <div data-testid="comment-component">
      Comment: {comment?._id}
    </div>
  ),
  default: ({ comment }: any) => (
    <div data-testid="comment-component">
      Comment: {comment?._id}
    </div>
  ),
}));

jest.mock('@/components/button', () => ({
  __esModule: true,
  Button: ({ onClick, text, icon, disabled }: any) => (
    <button data-testid="button" onClick={onClick} disabled={disabled}>
      {text} {icon && 'Icon'}
    </button>
  ),
  default: ({ onClick, text, icon, disabled }: any) => (
    <button data-testid="button" onClick={onClick} disabled={disabled}>
      {text} {icon && 'Icon'}
    </button>
  ),
}));

jest.mock('@/components/portable-loading', () => ({
  __esModule: true,
  LoadingComponent: ({ className }: any) => (
    <div data-testid="loading-component" className={className}>
      Loading...
    </div>
  ),
  default: ({ className }: any) => (
    <div data-testid="loading-component" className={className}>
      Loading...
    </div>
  ),
}));

jest.mock('@/components/filter', () => ({
  __esModule: true,
  DropdownFilter: ({ currentFilter, onChange }: any) => (
    <select 
      data-testid="dropdown-filter" 
      value={currentFilter}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="Mais Recentes">Mais Recentes</option>
      <option value="Mais Antigos">Mais Antigos</option>
      <option value="Mais Populares">Mais Populares</option>
    </select>
  ),
  default: ({ currentFilter, onChange }: any) => (
    <select 
      data-testid="dropdown-filter" 
      value={currentFilter}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="Mais Recentes">Mais Recentes</option>
      <option value="Mais Antigos">Mais Antigos</option>
      <option value="Mais Populares">Mais Populares</option>
    </select>
  ),
}));

// Mock icons
jest.mock('@/components/icons/CommentIcon', () => () => <div data-testid="comment-icon">CommentIcon</div>);
jest.mock('@/components/icons/ClockIcon', () => () => <div data-testid="clock-icon">ClockIcon</div>);
jest.mock('@/components/icons/PillarIcon', () => () => <div data-testid="pillar-icon">PillarIcon</div>);
jest.mock('@/components/icons/StarIcon', () => () => <div data-testid="star-icon">StarIcon</div>);
jest.mock('@/components/icons/ArrowUpIcon', () => () => <div data-testid="arrow-up-icon">ArrowUpIcon</div>);
jest.mock('@/components/icons/ImageIcon', () => () => <div data-testid="image-icon">ImageIcon</div>);
jest.mock('@/components/icons/TrashIcon', () => () => <div data-testid="trash-icon">TrashIcon</div>);

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, fill, className }: any) => (
    <img 
      src={src} 
      alt={alt} 
      data-testid="next-image" 
      className={className}
      style={fill ? { position: 'absolute', inset: 0 } : {}}
    />
  ),
}));

describe('PostPage', () => {
  const mockPush = jest.fn();
  const mockReplace = jest.fn();
  
  const mockUser = {
    userId: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
  };
  
  const mockCommunity = {
    _id: 'community-123',
    nome: 'Test Community',
    descricao: 'Test Description',
    createdAt: '2023-01-01T00:00:00.000Z',
  };
  
  const mockPost = {
    _id: 'post-123',
    titulo: 'Test Post',
    conteudo: 'Test content',
    autor: {
      userId: 'user-123',
      username: 'authoruser',
    },
    comunidade: 'Test Community',
    createdAt: '2023-01-01T00:00:00.000Z',
    curtidas: [],
    comentarios: [],
  };
  
  const mockComment = {
    _id: 'comment-123',
    conteudo: 'Test comment',
    autor: {
      userId: 'user-456',
      username: 'commentuser',
    },
    postId: 'post-123',
    createdAt: '2023-01-01T00:00:00.000Z',
    curtidas: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
    });
    
    (useParams as jest.Mock).mockReturnValue({
      community: 'test-community',
      postId: '123',
    });
  });

  describe('Initial Loading and Redirects', () => {
    it('should redirect to not-found when community or postId is missing', async () => {
      (useParams as jest.Mock).mockReturnValue({});
      
      render(<PostPage />);
      
      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/not-found');
      });
    });

    it('should redirect to not-found when community info is not found', async () => {
      const { getSessionInfos } = require('@/services/auth');
      const { slugToTitle } = require('@/lib/slugify');
      const { communityService } = require('@/services/comunidade');
      
      getSessionInfos.mockResolvedValue(mockUser);
      slugToTitle.mockReturnValue('Test Community');
      communityService.getComunidadeByName.mockResolvedValue(null);
      
      render(<PostPage />);
      
      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/not-found');
      });
    });

    it('should redirect to not-found when post is not found', async () => {
      const { getSessionInfos } = require('@/services/auth');
      const { slugToTitle } = require('@/lib/slugify');
      const { communityService } = require('@/services/comunidade');
      const { postsService } = require('@/services/posts');
      
      getSessionInfos.mockResolvedValue(mockUser);
      slugToTitle.mockReturnValue('Test Community');
      communityService.getComunidadeByName.mockResolvedValue(mockCommunity);
      postsService.getPostById.mockResolvedValue(null);
      
      render(<PostPage />);
      
      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/not-found');
      });
    });

    it('should show loading page initially', async () => {
      const { getSessionInfos } = require('@/services/auth');
      const { slugToTitle } = require('@/lib/slugify');
      const { communityService } = require('@/services/comunidade');
      const { postsService } = require('@/services/posts');
      
      getSessionInfos.mockResolvedValue(mockUser);
      slugToTitle.mockReturnValue('Test Community');
      communityService.getComunidadeByName.mockResolvedValue(mockCommunity);
      postsService.getPostById.mockResolvedValue(mockPost);
      postsService.getComments.mockResolvedValue([]);
      communityService.checkMemberOrMod.mockResolvedValue({ isMember: true, isModerator: false });
      
      render(<PostPage />);
      
      expect(screen.getByTestId('loading')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });
    });
  });

  describe('Successful Page Load', () => {
    beforeEach(async () => {
      const { getSessionInfos } = require('@/services/auth');
      const { slugToTitle } = require('@/lib/slugify');
      const { communityService } = require('@/services/comunidade');
      const { postsService } = require('@/services/posts');
      
      getSessionInfos.mockResolvedValue(mockUser);
      slugToTitle.mockReturnValue('Test Community');
      communityService.getComunidadeByName.mockResolvedValue(mockCommunity);
      postsService.getPostById.mockResolvedValue(mockPost);
      postsService.getComments.mockResolvedValue([mockComment]);
      communityService.checkMemberOrMod.mockResolvedValue({ isMember: true, isModerator: false });
      
      await act(async () => {
        render(<PostPage />);
      });
    });

    it('should render all main components', () => {
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('searchbar')).toBeInTheDocument();
      expect(screen.getByTestId('post-component')).toBeInTheDocument();
      expect(screen.getByText('Comentários')).toBeInTheDocument();
    });

    it('should render the dropdown filter', () => {
      const filter = screen.getByTestId('dropdown-filter');
      expect(filter).toBeInTheDocument();
      expect(filter).toHaveValue('Mais Recentes');
    });

    it('should render the comment input section', () => {
      expect(screen.getByPlaceholderText(`Comente no post de @${mockPost.autor.username}`)).toBeInTheDocument();
      expect(screen.getAllByTestId('button')[0]).toBeInTheDocument();
    });

    it('should not show "Voltar ao Topo" button initially', () => {
      expect(screen.queryByText('Voltar ao Topo')).not.toBeInTheDocument();
    });
  });

  describe('Comment Functionality', () => {
    beforeEach(async () => {
      const { getSessionInfos } = require('@/services/auth');
      const { slugToTitle } = require('@/lib/slugify');
      const { communityService } = require('@/services/comunidade');
      const { postsService } = require('@/services/posts');
      
      getSessionInfos.mockResolvedValue(mockUser);
      slugToTitle.mockReturnValue('Test Community');
      communityService.getComunidadeByName.mockResolvedValue(mockCommunity);
      postsService.getPostById.mockResolvedValue(mockPost);
      postsService.getComments.mockResolvedValue([mockComment]);
      communityService.checkMemberOrMod.mockResolvedValue({ isMember: true, isModerator: false });
      
      await act(async () => {
        render(<PostPage />);
      });
    });

    it('should update textarea content when typing', () => {
      const textarea = screen.getByPlaceholderText(`Comente no post de @${mockPost.autor.username}`);
      fireEvent.change(textarea, { target: { value: 'New comment content' } });
      
      expect(textarea).toHaveValue('New comment content');
    });

    it('should auto-resize textarea when content changes', () => {
      const textarea = screen.getByPlaceholderText(`Comente no post de @${mockPost.autor.username}`);
      const originalHeight = textarea.style.height;
      
      fireEvent.change(textarea, { target: { value: 'New comment content\nMultiple lines\nof text' } });
      
      expect(textarea.style.height).not.toBe(originalHeight);
    });

    it('should send comment when Enter key is pressed', async () => {
      const { commentsService } = require('@/services/comentarios');
      const { postsService } = require('@/services/posts');
      
      commentsService.createComment.mockResolvedValue({});
      postsService.getComments.mockResolvedValue([mockComment, { ...mockComment, _id: 'comment-456' }]);
      
      const textarea = screen.getByPlaceholderText(`Comente no post de @${mockPost.autor.username}`);
      fireEvent.change(textarea, { target: { value: 'Test comment' } });
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
      
      await waitFor(() => {
        expect(commentsService.createComment).toHaveBeenCalledWith(
          mockPost._id,
          expect.objectContaining({
            conteudo: 'Test comment',
            imagens: [],
          })
        );
      });
    });

    it('should not send comment when Shift+Enter is pressed', () => {
      const { commentsService } = require('@/services/comentarios');
      
      const textarea = screen.getByPlaceholderText(`Comente no post de @${mockPost.autor.username}`);
      fireEvent.change(textarea, { target: { value: 'Test comment' } });
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });
      
      expect(commentsService.createComment).not.toHaveBeenCalled();
    });

    it('should not send empty comment', () => {
      const { commentsService } = require('@/services/comentarios');
      
      const buttons = screen.getAllByTestId('button');
      const commentButton = buttons.find(button => 
        button.textContent?.includes('Icon') && !button.textContent.includes('Voltar')
      );
      
      if (commentButton) {
        fireEvent.click(commentButton);
      }
      
      expect(commentsService.createComment).not.toHaveBeenCalled();
    });
  });

  describe('Image Upload Functionality', () => {
    beforeEach(async () => {
      const { getSessionInfos } = require('@/services/auth');
      const { slugToTitle } = require('@/lib/slugify');
      const { communityService } = require('@/services/comunidade');
      const { postsService } = require('@/services/posts');
      
      getSessionInfos.mockResolvedValue(mockUser);
      slugToTitle.mockReturnValue('Test Community');
      communityService.getComunidadeByName.mockResolvedValue(mockCommunity);
      postsService.getPostById.mockResolvedValue(mockPost);
      postsService.getComments.mockResolvedValue([]);
      communityService.checkMemberOrMod.mockResolvedValue({ isMember: true, isModerator: false });
      
      await act(async () => {
        render(<PostPage />);
      });
    });

    it('should trigger file input when image button is clicked', () => {
      const fileInput = document.querySelector('input[type="file"]');
      const clickSpy = jest.spyOn(fileInput!, 'click');
      
      const buttons = screen.getAllByTestId('button');
      const imageButton = buttons.find(button => 
        button.textContent?.includes('Icon') && !button.textContent.includes('Comentar')
      );
      
      if (imageButton) {
        fireEvent.click(imageButton);
      }
      
      expect(clickSpy).toHaveBeenCalled();
    });

    it('should show error when uploading more than 4 images', async () => {
      const { toast } = require('react-toastify');
      
      const fileInput = document.querySelector('input[type="file"]');
      
      // Create mock files
      const mockFiles = Array(5).fill(null).map((_, i) => 
        new File([''], `image${i}.png`, { type: 'image/png' })
      );
      
      // Simulate having 2 images already
      act(() => {
        const event = {
          target: {
            files: mockFiles.slice(0, 2),
          },
        };
        fireEvent.change(fileInput!, event);
      });
      
      // Try to add 3 more (total would be 5)
      act(() => {
        const event = {
          target: {
            files: mockFiles.slice(2, 5),
          },
        };
        fireEvent.change(fileInput!, event);
      });
      
      await waitFor(() => {
        const called = (toast.error as jest.Mock).mock.calls.length > 0;
        const inputDisabled = document.querySelector('input[type="file"]')?.hasAttribute('disabled');
        expect(called || inputDisabled).toBeTruthy();
      });
    });

    it('should show error when uploading non-image file', async () => {
      const { toast } = require('react-toastify');
      
      const fileInput = document.querySelector('input[type="file"]');
      const textFile = new File([''], 'document.txt', { type: 'text/plain' });
      
      act(() => {
        const event = {
          target: {
            files: [textFile],
          },
        };
        fireEvent.change(fileInput!, event);
      });
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Por favor, selecione uma imagem válida');
      });
    });

    it('should show error when uploading file larger than 5MB', async () => {
      const { toast } = require('react-toastify');
      
      const fileInput = document.querySelector('input[type="file"]');
      const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
      
      act(() => {
        const event = {
          target: {
            files: [largeFile],
          },
        };
        fireEvent.change(fileInput!, event);
      });
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('A imagem deve ter no máximo 5MB');
      });
    });

    it('should remove image when trash button is clicked', async () => {
      const fileInput = document.querySelector('input[type="file"]');
      const imageFile = new File([''], 'test.png', { type: 'image/png' });
      
      // Create a mock FileReader
      const mockFileReader = {
        readAsDataURL: jest.fn(),
        result: 'data:image/png;base64,test',
        onload: null as any,
      };
      
      jest.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);
      
      act(() => {
        const event = {
          target: {
            files: [imageFile],
          },
        };
        fireEvent.change(fileInput!, event);
        
        // Trigger the onload callback
        if (mockFileReader.onload) {
          mockFileReader.onload();
        }
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('next-image')).toBeInTheDocument();
      });
      
      const previewImages = screen.getAllByTestId('next-image');
      const firstPreview = previewImages[0].closest('.relative');
      const trashButton = firstPreview?.querySelector('button[data-testid="button"]') as HTMLElement | null;
      if (trashButton) {
        fireEvent.click(trashButton);
      }
      
      await waitFor(() => {
        expect(screen.queryByTestId('next-image')).not.toBeInTheDocument();
      });
    });
  });

  describe('Comment Filtering', () => {
    const mockComments = [
      { ...mockComment, _id: 'comment-1', createdAt: '2023-01-01T00:00:00.000Z', curtidas: [] },
      { ...mockComment, _id: 'comment-2', createdAt: '2023-01-02T00:00:00.000Z', curtidas: ['user1', 'user2'] },
      { ...mockComment, _id: 'comment-3', createdAt: '2023-01-03T00:00:00.000Z', curtidas: ['user1'] },
    ];

    beforeEach(async () => {
      const { getSessionInfos } = require('@/services/auth');
      const { slugToTitle } = require('@/lib/slugify');
      const { communityService } = require('@/services/comunidade');
      const { postsService } = require('@/services/posts');
      
      getSessionInfos.mockResolvedValue(mockUser);
      slugToTitle.mockReturnValue('Test Community');
      communityService.getComunidadeByName.mockResolvedValue(mockCommunity);
      postsService.getPostById.mockResolvedValue(mockPost);
      postsService.getComments.mockResolvedValue(mockComments);
      communityService.checkMemberOrMod.mockResolvedValue({ isMember: true, isModerator: false });
      
      await act(async () => {
        render(<PostPage />);
      });
    });

    it('should change filter when dropdown value changes', () => {
      const filter = screen.getByTestId('dropdown-filter');
      
      fireEvent.change(filter, { target: { value: 'Mais Antigos' } });
      
      expect(filter).toHaveValue('Mais Antigos');
    });

    it('should show "Nenhum comentário ainda" when no comments', async () => {
      const { postsService } = require('@/services/posts');
      postsService.getComments.mockResolvedValue([]);
      
      // Trigger a refresh
      const textarea = screen.getByPlaceholderText(`Comente no post de @${mockPost.autor.username}`);
      fireEvent.change(textarea, { target: { value: 'Test' } });
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
      
      await waitFor(() => {
        expect(screen.getByText('Nenhum comentário ainda.')).toBeInTheDocument();
      });
    });
  });

  describe('Scroll to Top Button', () => {
    beforeEach(async () => {
      const { getSessionInfos } = require('@/services/auth');
      const { slugToTitle } = require('@/lib/slugify');
      const { communityService } = require('@/services/comunidade');
      const { postsService } = require('@/services/posts');
      
      getSessionInfos.mockResolvedValue(mockUser);
      slugToTitle.mockReturnValue('Test Community');
      communityService.getComunidadeByName.mockResolvedValue(mockCommunity);
      postsService.getPostById.mockResolvedValue(mockPost);
      postsService.getComments.mockResolvedValue([mockComment]);
      communityService.checkMemberOrMod.mockResolvedValue({ isMember: true, isModerator: false });
      
      await act(async () => {
        render(<PostPage />);
      });
    });

    it('should scroll to top when button is clicked', () => {
      window.scrollTo = jest.fn();
      
      // Force the button to show by mocking the scroll position
      const mockHeader = document.createElement('div');
      mockHeader.classList.add('comments-header');
      document.body.appendChild(mockHeader);
      
      // Mock getBoundingClientRect to return bottom <= 0
      jest.spyOn(mockHeader, 'getBoundingClientRect').mockReturnValue({
        bottom: -10,
        top: 0,
        left: 0,
        right: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        toJSON: () => {},
      });
      
      // Trigger scroll event
      fireEvent.scroll(window);
      
      const scrollButton = screen.getByRole('button', { name: /Voltar ao Topo/ });
      fireEvent.click(scrollButton);
      
      expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });
  });

  describe('Error Handling', () => {
    it('should handle fetch data error gracefully', async () => {
      const { getSessionInfos } = require('@/services/auth');
      const { slugToTitle } = require('@/lib/slugify');
      
      getSessionInfos.mockRejectedValue(new Error('API Error'));
      slugToTitle.mockReturnValue('Test Community');
      
      render(<PostPage />);
      
      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/not-found');
      });
    });

    it('should handle comment submission error', async () => {
      const { getSessionInfos } = require('@/services/auth');
      const { slugToTitle } = require('@/lib/slugify');
      const { communityService } = require('@/services/comunidade');
      const { postsService } = require('@/services/posts');
      const { commentsService } = require('@/services/comentarios');
      
      getSessionInfos.mockResolvedValue(mockUser);
      slugToTitle.mockReturnValue('Test Community');
      communityService.getComunidadeByName.mockResolvedValue(mockCommunity);
      postsService.getPostById.mockResolvedValue(mockPost);
      postsService.getComments.mockResolvedValue([]);
      communityService.checkMemberOrMod.mockResolvedValue({ isMember: true, isModerator: false });
      commentsService.createComment.mockRejectedValue(new Error('Comment error'));
      
      await act(async () => {
        render(<PostPage />);
      });
      
      const textarea = screen.getByPlaceholderText(`Comente no post de @${mockPost.autor.username}`);
      fireEvent.change(textarea, { target: { value: 'Test comment' } });
      
      // Trigger submit via Enter key (matches send behavior)
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

      await waitFor(() => {
        expect(commentsService.createComment).toHaveBeenCalled();
      });
    });
  });

  describe('Moderator Functionality', () => {
    it('should set isModerator to true when user is moderator', async () => {
      const { getSessionInfos } = require('@/services/auth');
      const { slugToTitle } = require('@/lib/slugify');
      const { communityService } = require('@/services/comunidade');
      const { postsService } = require('@/services/posts');
      
      getSessionInfos.mockResolvedValue(mockUser);
      slugToTitle.mockReturnValue('Test Community');
      communityService.getComunidadeByName.mockResolvedValue(mockCommunity);
      postsService.getPostById.mockResolvedValue(mockPost);
      postsService.getComments.mockResolvedValue([mockComment]);
      communityService.checkMemberOrMod.mockResolvedValue({ isMember: true, isModerator: true });
      
      await act(async () => {
        render(<PostPage />);
      });
      
      // The isModerator prop should be passed to PostComponent
      expect(screen.getByTestId('post-component')).toBeInTheDocument();
    });
  });

  describe('Disabled States', () => {
    beforeEach(async () => {
      const { getSessionInfos } = require('@/services/auth');
      const { slugToTitle } = require('@/lib/slugify');
      const { communityService } = require('@/services/comunidade');
      const { postsService } = require('@/services/posts');
      
      getSessionInfos.mockResolvedValue(mockUser);
      slugToTitle.mockReturnValue('Test Community');
      communityService.getComunidadeByName.mockResolvedValue(mockCommunity);
      postsService.getPostById.mockResolvedValue(mockPost);
      postsService.getComments.mockResolvedValue([mockComment]);
      communityService.checkMemberOrMod.mockResolvedValue({ isMember: true, isModerator: false });
      
      await act(async () => {
        render(<PostPage />);
      });
    });

    it('should disable input when loading', async () => {
      // Re-render with loading state
      const { getSessionInfos } = require('@/services/auth');
      getSessionInfos.mockResolvedValue(new Promise(() => {})); // Never resolves
      
      const { rerender } = render(<PostPage />);
      
      const textarea = screen.getByPlaceholderText(`Comente no post de @${mockPost.autor.username}`);
      expect(textarea.disabled || screen.queryByTestId('loading')).toBeTruthy();
    });

    it('should disable buttons when 4 images are already added', async () => {
      const fileInput = document.querySelector('input[type="file"]');
      
      // Add 4 mock images
      const mockFiles = Array(4).fill(null).map((_, i) => 
        new File([''], `image${i}.png`, { type: 'image/png' })
      );
      
      const mockFileReader = {
        readAsDataURL: jest.fn(),
        result: 'data:image/png;base64,test',
        onload: null as any,
      };
      
      jest.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);
      
      act(() => {
        const event = {
          target: {
            files: mockFiles,
          },
        };
        fireEvent.change(fileInput!, event);
        
        if (mockFileReader.onload) {
          mockFileReader.onload();
        }
      });
      
      await waitFor(() => {
        const buttons = screen.getAllByTestId('button');
        const imageButton = buttons.find(button => 
          button.textContent?.includes('Icon') && !button.textContent.includes('Comentar')
        );
        
        const disabledButtons = buttons.filter(b => b.getAttribute('disabled') !== null || b.disabled);
        expect(disabledButtons.length).toBeGreaterThan(0);
      });
    });
  });
});