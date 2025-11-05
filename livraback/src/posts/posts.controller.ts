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
    return this.postsService.create(user.userId, createPostDto);
  }

  // listar posts da comunidade
  @Get('comunidade/:comunidadeId')
  @ApiOperation({
    summary: 'Lista posts de uma comunidade',
    description: 'Retorna todos os posts publicados de uma comunidade'
  })
  @ApiParam({ name: 'comunidadeId', description: 'ID da comunidade' })
  @ApiResponse({
    status: 200,
    description: 'Lista de posts retornada com sucesso'
  })
  @ApiResponse({
    status: 404,
    description: 'Comunidade não encontrada'
  })
  async findAllByComunidade(@Param('comunidadeId') comunidadeId: string, @CurrentUser() user: CurrentUserDto) {
    return this.postsService.findAllByComunidade(comunidadeId, user.userId);
  }

  @Get('comunidade/:comunidadeId/categoria/:categoria')
  @ApiOperation({
    summary: 'Lista posts por categoria',
    description: 'Retorna posts de uma comunidade filtrados por categoria (geral, fanart, fanfic)'
  })
  @ApiParam({ name: 'comunidadeId', description: 'ID da comunidade' })
  @ApiParam({ name: 'categoria', enum: PostCategoria, description: 'Categoria do post' })
  @ApiResponse({
    status: 200,
    description: 'Lista de posts filtrada retornada com sucesso'
  })
  async findByCategoria(
    @Param('comunidadeId') comunidadeId: string,
    @Param('categoria') categoria: PostCategoria
  ) {
    return this.postsService.findAllByCategoria(comunidadeId, categoria);
  }

  @Get('comunidade/:comunidadeId/pendentes')
  @ApiOperation({
    summary: 'Lista posts pendentes de moderação',
    description: 'Retorna posts aguardando moderação. Apenas para moderadores e criadores da comunidade.'
  })
  @ApiParam({ name: 'comunidadeId', description: 'ID da comunidade' })
  @ApiResponse({
    status: 200,
    description: 'Lista de posts pendentes retornada com sucesso'
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não é moderador'
  })
  @ApiResponse({
    status: 404,
    description: 'Comunidade não encontrada'
  })
  async findPendentes(@Param('comunidadeId') comunidadeId: string, @CurrentUser() user: CurrentUserDto) {
    return this.postsService.findPendentes(comunidadeId, user.userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Busca um post específico',
    description: 'Retorna detalhes completos de um post incluindo comentários'
  })
  @ApiParam({ name: 'id', description: 'ID do post' })
  @ApiResponse({
    status: 200,
    description: 'Post retornado com sucesso'
  })
  @ApiResponse({
    status: 404,
    description: 'Post não encontrado'
  })
  @ApiResponse({
    status: 400,
    description: 'ID inválido'
  })
  async findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualiza um post',
    description: 'Atualiza um post. Apenas o autor pode editar.'
  })
  @ApiParam({ name: 'id', description: 'ID do post' })
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
    return this.postsService.update(user.userId, id, updatePostDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Remove um post',
    description: 'Remove um post. Autor, moderadores e criador da comunidade podem deletar.'
  })
  @ApiParam({ name: 'id', description: 'ID do post' })
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
    return this.postsService.remove(user.userId, id);
  }

  @Patch(':id/moderar')
  @ApiOperation({
    summary: 'Modera um post pendente',
    description: 'Aprova ou rejeita um post pendente, definindo sua categoria. Apenas para moderadores.'
  })
  @ApiParam({ name: 'id', description: 'ID do post' })
  @ApiResponse({
    status: 200,
    description: 'Post moderado com sucesso'
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não é moderador'
  })
  @ApiResponse({
    status: 404,
    description: 'Post não encontrado'
  })
  @ApiResponse({
    status: 400,
    description: 'Post não está pendente de moderação ou dados inválidos'
  })
  async moderarPost(
    @CurrentUser() user: CurrentUserDto,
    @Param('id') id: string,
    @Body() moderarDto: ModerarPostDto
  ) {
    return this.postsService.moderarPost(
      user.userId, 
      id, 
      moderarDto.categoria, 
      moderarDto.aprovar
    );
  }

  @Post(':id/curtir')
  @ApiOperation({
    summary: 'Curte/descurte um post',
    description: 'Toggle de curtida em um post'
  })
  @ApiParam({ name: 'id', description: 'ID do post' })
  @ApiResponse({
    status: 200,
    description: 'Curtida registrada/removida com sucesso'
  })
  @ApiResponse({
    status: 404,
    description: 'Post não encontrado'
  })
  async curtirPost(@CurrentUser() user: CurrentUserDto, @Param('id') id: string) {
    return this.postsService.curtirPost(user.userId, id);
  }
}
