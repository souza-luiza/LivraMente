import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ModerarPostDto } from './dto/moderar-post.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentUserDto } from '../auth/dto/current-user.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiParam, ApiBody } from '@nestjs/swagger';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';

@ApiTags('Posts')
@ApiBearerAuth()
@UseGuards(SessionAuthGuard)
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
  @ApiBody({ 
    type: CreatePostDto
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
    description: 'Permite a edição de um post ao seu autor.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID do post'
  })
  @ApiBody({ 
    type: UpdatePostDto
  })
  @ApiResponse({
    status: 200,
    description: 'Post atualizado com sucesso'
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos'
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não é o autor do post, não é membro da comunidade ou post está pendente de moderação'
  })
  @ApiResponse({
    status: 404,
    description: 'Post/Comunidade não encontrado/a'
  })
  async update(@CurrentUser() user: CurrentUserDto, @Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.updatePost(user.userId, id, updatePostDto);
  }

  // MODERAR POSTAGENS
  @Patch(':id/moderar')
  @ApiOperation({
    summary: 'Modera um post pendente',
    description: 'Modera um post pendente. Apenas moderadores da comunidade podem moderar.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID do post'
  })
  @ApiBody({ 
    type: ModerarPostDto
  })
  @ApiResponse({
    status: 200,
    description: 'Post moderado com sucesso'
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos'
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não é moderador da comunidade'
  })
  @ApiResponse({
    status: 404,
    description: 'Post/Comunidade não encontrado/a'
  })
  async moderatePost(@CurrentUser() user: CurrentUserDto, @Param('id') postId: string, @Body() moderarPostDto: ModerarPostDto) {
    return this.postsService.moderatePost(user.userId, postId, moderarPostDto);
  }

  // ENCONTRAR POSTAGEM
  @Get(':id/comunidade/:comunidadeNome')
  @ApiOperation({
    summary: 'Encontra um post de uma comunidade pelo ID',
    description: 'Encontra um post pertencente a uma comunidade pelo ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Post encontrado com sucesso'
  })
  @ApiResponse({
    status: 404,
    description: 'Post/Comunidade não encontrado/a'
  })
  async getPostById(@Param('id') postId: string, @Param('comunidadeNome') comunidadeNome: string) {
    return this.postsService.getPostById(postId, comunidadeNome);
  }

  // ENCONTRAR COMENTÁRIOS DA POSTAGEM
  @Get(':id/comentarios')
  @ApiOperation({
    summary: 'Retorna todos os comentários de um post'
  })
  @ApiResponse({
    status: 200,
    description: 'Comentários retornados com sucesso'
  })
  @ApiResponse({
    status: 404,
    description: 'Post não encontrado'
  })
  async getComments(@Param('id') postId: string){
    return this.postsService.getComments(postId);
  }
}
