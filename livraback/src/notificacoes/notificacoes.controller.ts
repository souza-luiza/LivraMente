import { Controller, Get, Patch, Delete, Param, UseGuards, Sse, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { NotificacoesService } from './notificacoes.service';
import { Observable, map } from 'rxjs';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SUCCESS_MESSAGES } from './notificacoes.constants';

interface MessageEvent {
  data: string;
}

/**
 * Controller responsável por gerenciar notificações dos usuários
 * Implementa operações CRUD e streaming via SSE
 */
@ApiTags('Notificações')
@Controller('notificacoes')
@UseGuards(SessionAuthGuard)
export class NotificacoesController {
  constructor(private readonly notificacoesService: NotificacoesService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Buscar todas as notificações',
    description: 'Retorna todas as notificações do usuário autenticado ordenadas por data de criação'
  })
  @ApiResponse({ status: 200, description: 'Lista de notificações retornada com sucesso' })
  @ApiResponse({ status: 401, description: 'Usuário não autenticado' })
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marcar notificação como lida' })
  @ApiParam({ name: 'id', description: 'ID da notificação' })
  @ApiResponse({ status: 200, description: 'Notificação marcada como lida' })
  @ApiResponse({ status: 404, description: 'Notificação não encontrada' })
  async marcarComoLida(@Req() req: any, @Param('id') id: string) {
    await this.notificacoesService.marcarComoLida(id, req.session.user.userId);
    return { message: SUCCESS_MESSAGES.NOTIFICATION.MARKED_AS_READ };
  }

  @Patch('marcar-todas-lidas')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marcar todas as notificações como lidas' })
  @ApiResponse({ status: 200, description: 'Todas as notificações marcadas como lidas' })
  async marcarTodasComoLidas(@Req() req: any) {
    await this.notificacoesService.marcarTodasComoLidas(req.session.user.userId);
    return { message: SUCCESS_MESSAGES.NOTIFICATION.ALL_MARKED_AS_READ };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remover notificação' })
  @ApiParam({ name: 'id', description: 'ID da notificação' })
  @ApiResponse({ status: 200, description: 'Notificação removida' })
  @ApiResponse({ status: 404, description: 'Notificação não encontrada' })
  async remover(@Req() req: any, @Param('id') id: string) {
    await this.notificacoesService.remover(id, req.session.user.userId);
    return { message: SUCCESS_MESSAGES.NOTIFICATION.DELETED };
  }

  @Sse('stream')
  @ApiOperation({ 
    summary: 'Stream de notificações em tempo real',
    description: 'Estabelece conexão SSE para receber notificações em tempo real'
  })
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
