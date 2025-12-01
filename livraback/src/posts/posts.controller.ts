import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ModerarPostDto } from './dto/moderar-post.dto';
import { SearchPostsDto } from './dto/search-posts.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentUserDto } from '../auth/dto/current-user.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';

@ApiTags('Posts')
@ApiBearerAuth()
@UseGuards(SessionAuthGuard)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // BUSCAR TODOS OS POSTS (FEED PÚBLICO)
  @Get('feed')
  @ApiOperation({
    summary: 'Busca todos os posts públicos para o feed',
    description: 'Retorna posts de todas as comunidades com suporte a paginação, filtros por categoria/comunidade e ordenação.'
  })
  @ApiQuery({ name: 'q', required: false, description: 'Termo de busca (conteúdo ou tags)' })
  @ApiQuery({ name: 'page', required: false, description: 'Número da página (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Posts por página (default: 10)' })
  @ApiQuery({ name: 'categoria', required: false, description: 'Filtrar por categoria', enum: ['geral', 'fanart', 'fanfic'] })
  @ApiQuery({ name: 'comunidade', required: false, description: 'Filtrar por comunidade (nome ou ID)' })
  @ApiQuery({ name: 'sort', required: false, description: 'Ordenação: recent ou popular', enum: ['recent', 'popular'] })
  @ApiResponse({
    status: 200,
    description: 'Posts retornados com sucesso',
    schema: {
      properties: {
        posts: { type: 'array', description: 'Lista de posts' },
        total: { type: 'number', description: 'Total de posts encontrados' },
        page: { type: 'number', description: 'Página atual' },
        limit: { type: 'number', description: 'Posts por página' },
        totalPages: { type: 'number', description: 'Total de páginas' }
      }
    }
  })
  async searchPosts(@Query() searchPostsDto: SearchPostsDto) {
    return this.postsService.searchPosts(searchPostsDto);
  }

  // BUSCAR POSTS DO FEED DO USUÁRIO (COMUNIDADES QUE FAZ PARTE)
  @Get('meu-feed')
  @ApiOperation({
    summary: 'Busca posts do feed personalizado do usuário',
    description: 'Retorna posts das comunidades das quais o usuário é membro.'
  })
  @ApiQuery({ name: 'q', required: false, description: 'Termo de busca (conteúdo ou tags)' })
  @ApiQuery({ name: 'page', required: false, description: 'Número da página (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Posts por página (default: 10)' })
  @ApiQuery({ name: 'categoria', required: false, description: 'Filtrar por categoria', enum: ['geral', 'fanart', 'fanfic'] })
  @ApiQuery({ name: 'sort', required: false, description: 'Ordenação: recent ou popular', enum: ['recent', 'popular'] })
  @ApiResponse({
    status: 200,
    description: 'Posts do feed do usuário retornados com sucesso'
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT inválido'
  })
  async getMyFeed(@CurrentUser() user: CurrentUserDto, @Query() searchPostsDto: SearchPostsDto) {
    return this.postsService.getFeedPosts(user.userId, searchPostsDto);
  }

  // BUSCAR POSTS EM ALTA (TRENDING)
  @Get('trending')
  @ApiOperation({
    summary: 'Busca posts em alta (trending)',
    description: 'Retorna os posts mais populares das últimas 24 horas baseado em curtidas e comentários.'
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Número de posts a retornar (default: 10)' })
  @ApiResponse({
    status: 200,
    description: 'Posts em alta retornados com sucesso'
  })
  async getTrendingPosts(@Query('limit') limit?: number) {
    return this.postsService.getTrendingPosts(limit || 10);
  }

  // BUSCAR POSTS POR TAG
  @Get('tag/:tag')
  @ApiOperation({
    summary: 'Busca posts por tag',
    description: 'Retorna todos os posts que possuem uma tag específica.'
  })
  @ApiParam({ name: 'tag', description: 'Tag para buscar' })
  @ApiQuery({ name: 'page', required: false, description: 'Número da página (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Posts por página (default: 10)' })
  @ApiResponse({
    status: 200,
    description: 'Posts com a tag retornados com sucesso'
  })
  async getPostsByTag(
    @Param('tag') tag: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.postsService.getPostsByTag(tag, page || 1, limit || 10);
  }

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
