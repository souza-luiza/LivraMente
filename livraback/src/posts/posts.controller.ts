import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ModerarPostDto } from './dto/moderar-post.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentUserDto } from '../auth/dto/current-user.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { PostCategoria } from '../schemas/post.schema';

@ApiTags('posts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // CRIAR POSTAGENS
  @Post()
  @ApiOperation({
    summary: 'Cria uma nova postagem',
    description: 'Cria uma nova postagem em uma comunidade. Se solicitação_revisao for true, o post fica pendente de moderação.'
  })
  @ApiResponse({
    status: 201,
    description: 'Post criado com sucesso'
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos (máximo 4 imagens)'
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não é membro da comunidade'
  })
  @ApiResponse({
    status: 404,
    description: 'Comunidade não encontrada'
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT inválido'
  })
  async create(@CurrentUser() user: CurrentUserDto, @Body() createPostDto: CreatePostDto) {
    return this.postsService.createPost(user.userId, createPostDto);
  }

  // CURTIR POSTAGENS
  @Post(':id/curtir')
  @ApiOperation({
    summary: 'Curte ou descurte um post',
    description: 'Toggle de curtida em um post'
  })
  @ApiParam({
    name: 'id',
    description: 'ID do post'
  })
  @ApiResponse({
    status: 200,
    description: 'Curtida registrada/removida com sucesso'
  })
  @ApiResponse({
    status: 404,
    description: 'Post não encontrado'
  })
  async curtirPost(@CurrentUser() user: CurrentUserDto, @Param('id') postId: string) {
    return this.postsService.likePost(user.userId, postId);
  }

  // REMOVER POSTAGENS
  @Delete(':id/excluir')
  @ApiOperation({
    summary: 'Remove um post',
    description: 'Remove um post. Autor, moderadores e criador da comunidade podem deletar.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID do post'
  })
  @ApiResponse({
    status: 200,
    description: 'Post removido com sucesso'
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não tem permissão'
  })
  @ApiResponse({
    status: 404,
    description: 'Post não encontrado'
  })
  async remove(@CurrentUser() user: CurrentUserDto, @Param('id') id: string) {
    return this.postsService.removePost(user.userId, id);
  }

  // EDITAR POSTAGENS
  @Patch(':id/editar')
  @ApiOperation({
    summary: 'Atualiza um post',
    description: 'Atualiza um post. Apenas o autor pode editar.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID do post'
  })
  @ApiResponse({
    status: 200,
    description: 'Post atualizado com sucesso'
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não é o autor do post'
  })
  @ApiResponse({
    status: 404,
    description: 'Post não encontrado'
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos'
  })
  async update(@CurrentUser() user: CurrentUserDto, @Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.editPost(user.userId, id, updatePostDto);
  }

}
