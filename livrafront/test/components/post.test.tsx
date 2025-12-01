import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { postsService } from '@/services/posts';
import Post from '@/components/post';
import { Post as TypePost } from '@/types/post';

jest.mock('@/services/posts', () => ({
  postsService: {
    removePost: jest.fn(),
  },
}));

describe('Post component', () => {
  it('deve apagar o post da interface quando a API retornar sucesso', async () => {

    (postsService.removePost as jest.Mock).mockResolvedValueOnce({ status: 200 });

    const onDelete = jest.fn();
    const postMock: TypePost = {
        _id: 'post123',
        conteudo: 'teste',
        autor: {
          _id: 'user123',
          username: 'Usuário Teste',
          avatarUrl: '',
        },
        comunidade: {
          _id: 'comunidade123',
          nome: 'Comunidade Teste',
        },
        categoria: 'geral',
        status: 'publicado',
        solicitacao_revisao: false,
        imagens: [],
        curtidas: [],
        comentarios: [],
        tags: ['fantasia'],
        publico: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }

    const { getByTestId } = render(
      <Post post={postMock} currentUserId="user123" onDelete={onDelete} />
    );

    const botaoMais = getByTestId('botao-mais-opcoes');
    fireEvent.click(botaoMais);

    const botaoDeletar = getByTestId('botao-deletar');
    fireEvent.click(botaoDeletar);

    const PopUp = await screen.findByRole('button', { name: /Excluir/i });
    fireEvent.click(PopUp);

    await waitFor(() => {
      expect(postsService.removePost).toHaveBeenCalledWith('post123');
      expect(onDelete).toHaveBeenCalled();
    });
  });
});