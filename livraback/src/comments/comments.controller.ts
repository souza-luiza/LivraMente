import { UseGuards, Controller, Post, Get, Delete, Patch, Body, Param, UseInterceptors, BadRequestException, UploadedFiles } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CurrentUserDto } from '../auth/dto/current-user.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';

@ApiTags('Comentários')
@ApiBearerAuth()
@UseGuards(SessionAuthGuard)
@Controller('posts')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) {}

    // CRIAR COMENTÁRIO
    @Post(':postId/comentarios')
    @UseInterceptors(
        FilesInterceptor('imagens', 4, {
          fileFilter: (req, file, cb) => {
            const allowed = ['image/jpeg', 'image/png', 'image/webp'];
            if (!allowed.includes(file.mimetype)) {
              return cb(new BadRequestException('Formato de imagem inválido'), false);
            }
            cb(null, true);
          },
          limits: {
            fileSize: 5 * 1024 * 1024,
          },
        })
      )
    @ApiOperation({
        summary: 'Comentar um post',
        description: 'Criar comentário em um post específico'
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                conteudo: { type: 'string' },

                imagens: {
                    type: 'array',
                    items: { type: 'string', format: 'binary' },
                    description:
                    'Máximo de 4 imagens (JPEG, PNG, WEBP), cada uma até 5MB.',
                },
            },
        },
    })
    @ApiResponse({
        status: 201,
        description: 'Comentário criado com sucesso'
    })
    @ApiResponse({
        status: 400,
        description: 'Comentário deve conter texto e no máximo 4 imagens'
    })
    @ApiResponse({
        status: 403,
        description: 'Usuário não é membro da comunidade'
    })
    @ApiResponse({
        status: 404,
        description: 'Post/Comunidade não encontrado/a'
    })
    async createComment(@CurrentUser() user: CurrentUserDto, @Param('postId') postId: string, @Body() createCommentDto: CreateCommentDto, @UploadedFiles() imagens: Express.Multer.File[]) {
        return this.commentsService.createComment(user.userId, postId, createCommentDto, imagens);
    }

    @Delete(':postId/comentarios/:commentId')
    @ApiOperation({
        summary: 'Deletar comentário',
        description: 'Deletar comentário de um post específico'
    })
    @ApiResponse({
        status: 200,
        description: 'Comentário deletado com sucesso'
    })
    @ApiResponse({
        status: 401,
        description: 'Não autorizado. Token JWT inválido ou ausente.'
    })
    @ApiResponse({
        status: 404,
        description: 'Post/Comunidade não encontrado/a'
    })
    async deleteComment(@CurrentUser() user: CurrentUserDto, @Param('commentId') commentId: string) {
        return this.commentsService.deleteComment(user.userId, commentId);

    }

    @Post(':postId/comentarios/:commentId/curtir')
    @ApiOperation({
        summary: 'Curtir/Descurtir comentário',
        description: 'Curtir ou descurtir um comentário de um post'
    })
    @ApiResponse({
        status: 200,
        description: 'Comentário curtido/descurtido com sucesso'
    })
    @ApiResponse({
        status: 404,
        description: 'Post não encontrado'
    })
    async likeComment(@CurrentUser() user: CurrentUserDto, @Param('commentId') commentId: string) {
        return this.commentsService.likeComment(user.userId, commentId);
    }

    @Patch(':postId/comentarios/:commentId')
    @ApiOperation({
        summary: 'Atualizar o conteúdo de um comentário'
    })
    @ApiResponse({
        status: 200,
        description: 'Comentário atualizado com sucesso.'
    })
    @ApiResponse({
        status: 400,
        description: 'Formato inadequado'
    })
    @ApiResponse({
        status: 403,
        description: 'Usuário não é autor do comentário.'
    })
    @ApiResponse({
        status: 404,
        description: 'Post/Comentário não encontrado.'
    })
    async updateComment(@CurrentUser() user: CurrentUserDto, @Param('postId') postId: string, @Param('commentId') commentId: string, @Body() updateCommentDto: UpdateCommentDto) {
        return this.commentsService.updateComment(user.userId, postId, commentId, updateCommentDto);
    }
}