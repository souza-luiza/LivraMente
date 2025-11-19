import { Controller, Get, Patch, Delete, Param, UseGuards, Sse, Req } from '@nestjs/common';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { NotificacoesService } from './notificacoes.service';
import { Observable, map } from 'rxjs';
import { NotificacaoDocument } from '../schemas/notificacao.schema';

interface MessageEvent {
  data: string;
}

@Controller('notificacoes')
@UseGuards(SessionAuthGuard)
export class NotificacoesController {
  constructor(private readonly notificacoesService: NotificacoesService) {}

  @Get()
  async buscarTodas(@Req() req: any) {
    const userId = req.session.user.userId;
    const notificacoes = await this.notificacoesService.buscarTodas(userId);
    return notificacoes;
  }

  @Patch(':id/lida')
  async marcarComoLida(@Req() req: any, @Param('id') id: string) {
    await this.notificacoesService.marcarComoLida(id, req.session.user.userId);
    return { message: 'Notificação marcada como lida' };
  }

  @Patch('marcar-todas-lidas')
  async marcarTodasComoLidas(@Req() req: any) {
    await this.notificacoesService.marcarTodasComoLidas(req.session.user.userId);
    return { message: 'Todas as notificações marcadas como lidas' };
  }

  @Delete(':id')
  async remover(@Req() req: any, @Param('id') id: string) {
    await this.notificacoesService.remover(id, req.session.user.userId);
    return { message: 'Notificação removida' };
  }

  @Sse('stream')
  streamNotificacoes(@Req() req: any): Observable<MessageEvent> {
    const userId = req.session.user.userId;
    const subject = this.notificacoesService.registrarClienteSSE(userId);

    return subject.pipe(
      map((notificacao: NotificacaoDocument) => {
        const data: MessageEvent = {
          data: JSON.stringify({
            id: notificacao._id,
            tipo: notificacao.tipo,
            mensagem: notificacao.mensagem,
            lida: notificacao.lida,
            criadaEm: (notificacao as any).createdAt,
            remetente: notificacao.remetente
              ? {
                  id: (notificacao.remetente as any)._id,
                  username: (notificacao.remetente as any).username,
                  foto_perfil: (notificacao.remetente as any).foto_perfil,
                }
              : undefined,
            postId: notificacao.postId,
            comentarioId: notificacao.comentarioId,
            resenhaId: notificacao.resenhaId,
            readlistId: notificacao.readlistId,
            comunidadeNome: notificacao.comunidadeNome,
          }),
        };
        return data;
      }),
    );
  }
}
