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
    
    return notificacoes.map((n: any) => ({
      id: n._id.toString(),
      tipo: n.tipo,
      mensagem: n.mensagem,
      lida: n.lida,
      criadaEm: n.createdAt,
      remetente: n.remetente ? {
        id: n.remetente._id.toString(),
        username: n.remetente.username,
        foto_perfil: n.remetente.foto_perfil
      } : undefined,
      postId: n.postId?.toString(),
      comentarioId: n.comentarioId?.toString(),
      resenhaId: n.resenhaId?.toString(),
      readlistId: n.readlistId?.toString(),
      comunidadeNome: n.comunidadeNome
    }));
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
      map((notificacao: any) => {
        const data: MessageEvent = {
          data: JSON.stringify({
            id: notificacao._id.toString(),
            tipo: notificacao.tipo,
            mensagem: notificacao.mensagem,
            lida: notificacao.lida,
            criadaEm: notificacao.createdAt,
            remetente: notificacao.remetente
              ? {
                  id: notificacao.remetente._id.toString(),
                  username: notificacao.remetente.username,
                  foto_perfil: notificacao.remetente.foto_perfil,
                }
              : undefined,
            postId: notificacao.postId?.toString(),
            comentarioId: notificacao.comentarioId?.toString(),
            resenhaId: notificacao.resenhaId?.toString(),
            readlistId: notificacao.readlistId?.toString(),
            comunidadeNome: notificacao.comunidadeNome,
          }),
        };
        return data;
      }),
    );
  }
}
