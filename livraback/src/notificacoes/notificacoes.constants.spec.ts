import { 
  NOTIFICATION_MESSAGES, 
  ERROR_MESSAGES, 
  SUCCESS_MESSAGES 
} from './notificacoes.constants';

describe('NotificacoesConstants', () => {
  describe('NOTIFICATION_MESSAGES', () => {
    describe('POST', () => {
      it('deve gerar mensagem de novo post com nome da comunidade e preview', () => {
        const resultado = NOTIFICATION_MESSAGES.POST.NOVO('Livros de Ficção', 'Era uma vez');
        expect(resultado).toBe('Novo post em Livros de Ficção: Era uma vez...');
      });

      it('deve retornar mensagem de post curtido', () => {
        expect(NOTIFICATION_MESSAGES.POST.CURTIDO).toBe('Seu post foi curtido!');
      });

      it('deve gerar mensagem de post aprovado com categoria', () => {
        const resultado = NOTIFICATION_MESSAGES.POST.APROVADO('Romance');
        expect(resultado).toBe('Seu post foi aprovado na categoria Romance!');
      });

      it('deve retornar mensagem de post rejeitado', () => {
        expect(NOTIFICATION_MESSAGES.POST.REJEITADO).toBe('Seu post foi rejeitado pela moderação.');
      });
    });

    describe('COMENTARIO', () => {
      it('deve gerar mensagem de novo comentário com preview', () => {
        const resultado = NOTIFICATION_MESSAGES.COMENTARIO.NOVO('Ótimo livro!');
        expect(resultado).toBe('Novo comentário no seu post: "Ótimo livro!"');
      });

      it('deve retornar mensagem de comentário curtido', () => {
        expect(NOTIFICATION_MESSAGES.COMENTARIO.CURTIDO).toBe('Seu comentário foi curtido!');
      });
    });

    describe('COMUNIDADE', () => {
      it('deve gerar mensagem de novo membro com nome da comunidade', () => {
        const resultado = NOTIFICATION_MESSAGES.COMUNIDADE.NOVO_MEMBRO('Clube do Livro');
        expect(resultado).toBe('Novo membro entrou na comunidade Clube do Livro!');
      });
    });
  });

  describe('ERROR_MESSAGES', () => {
    describe('QUEUE', () => {
      it('deve ter mensagem de falha de conexão', () => {
        expect(ERROR_MESSAGES.QUEUE.CONNECTION_FAILED).toBe('Falha ao conectar ao RabbitMQ');
      });

      it('deve ter mensagem de falha ao publicar', () => {
        expect(ERROR_MESSAGES.QUEUE.PUBLISH_FAILED).toBe('Falha ao publicar mensagem');
      });

      it('deve ter mensagem de mensagem inválida', () => {
        expect(ERROR_MESSAGES.QUEUE.INVALID_MESSAGE).toBe('Formato de mensagem inválido');
      });
    });

    describe('NOTIFICATION', () => {
      it('deve ter mensagem de falha ao criar', () => {
        expect(ERROR_MESSAGES.NOTIFICATION.CREATE_FAILED).toBe('Falha ao criar notificação');
      });

      it('deve ter mensagem de não encontrado', () => {
        expect(ERROR_MESSAGES.NOTIFICATION.NOT_FOUND).toBe('Notificação não encontrada');
      });

      it('deve ter mensagem de não autorizado', () => {
        expect(ERROR_MESSAGES.NOTIFICATION.UNAUTHORIZED).toBe('Usuário não autorizado para esta notificação');
      });
    });
  });

  describe('SUCCESS_MESSAGES', () => {
    describe('NOTIFICATION', () => {
      it('deve ter mensagem de marcada como lida', () => {
        expect(SUCCESS_MESSAGES.NOTIFICATION.MARKED_AS_READ).toBe('Notificação marcada como lida');
      });

      it('deve ter mensagem de todas marcadas como lidas', () => {
        expect(SUCCESS_MESSAGES.NOTIFICATION.ALL_MARKED_AS_READ).toBe('Todas as notificações marcadas como lidas');
      });

      it('deve ter mensagem de removida', () => {
        expect(SUCCESS_MESSAGES.NOTIFICATION.DELETED).toBe('Notificação removida');
      });

      it('deve ter mensagem de todas removidas', () => {
        expect(SUCCESS_MESSAGES.NOTIFICATION.ALL_DELETED).toBe('Todas as notificações removidas');
      });
    });
  });
});
