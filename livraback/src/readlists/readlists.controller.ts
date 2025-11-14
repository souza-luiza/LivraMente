import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentUserDto } from '../auth/dto/current-user.dto';
import { ReadlistsService } from './readlists.service';
import { CreateReadlistDto } from './dto/create-readlist.dto';
import { UpdateReadlistDto } from './dto/update-readlist.dto';
import { ApiOperation, ApiResponse, ApiBody, ApiCookieAuth } from '@nestjs/swagger';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';

@ApiCookieAuth() //Informa que usa cookies
@UseGuards(SessionAuthGuard)
@Controller('readlists')
export class ReadlistsController {
    constructor(private readonly readlistsService: ReadlistsService) {}

    @Post()
    @ApiOperation({ 
        summary: 'Cria uma nova readlist',
        description: 'Cria nova readlist para usuário autenticado'
    })
    @ApiResponse({ 
        status: 201, 
        description: 'Readlist criada com sucesso',
        type: CreateReadlistDto
    })
    @ApiResponse({
        status: 401,
        description: 'Sessão inválida'
    })
    async create(@CurrentUser() user: CurrentUserDto, @Body() createReadlistDto: CreateReadlistDto) {
        return this.readlistsService.create(user.userId, createReadlistDto);
    }

    @Get()
    @ApiOperation({ 
        summary: 'Lista todas as readlists',
        description: 'Retorna todas readlists do usuário autenticado'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de readlists retornada com sucesso'
    })
    @ApiResponse({
        status: 401,
        description: 'Sessão inválida'
    })
    async findAll(@CurrentUser() user: CurrentUserDto) {
        return this.readlistsService.findAll(user.userId);
    }

    @Get(':slug')
    @ApiOperation({
        summary: 'Busca uma readlist',
        description: 'Retorna detalhes de uma readlist por slug que pertence ao usuario autenticado'
    })
    @ApiResponse({
        status: 200,
        description: 'Detalhes da Readlist retornados com sucesso'
    })
    @ApiResponse({
        status: 404,
        description: 'Readlist não encontrada'
    })
    @ApiResponse({
        status: 401,
        description: 'Sessão inválida'
    })
    async findOne(@CurrentUser() user: CurrentUserDto, @Param('slug') slug: string) {
        return this.readlistsService.findOne(user.userId, slug);
    }

    @Patch(':slug')
    @ApiOperation({
        summary: 'Atualiza uma readlist',
        description: 'Atualiza dados de uma readlist por slug do usuário autenticado'
    })
    @ApiResponse({
        status: 200,
        description: 'Detalhes da Readlist atualizados com sucesso'
    })
    @ApiResponse({
        status: 404,
        description: 'Readlist não encontrada'
    })
    @ApiResponse({
        status: 401,
        description: 'Sessão inválida'
    })
    async update(@CurrentUser() user: CurrentUserDto, @Param('slug') slug: string, @Body() updateReadlistDto: UpdateReadlistDto) {
        return this.readlistsService.update(user.userId, slug, updateReadlistDto);
    }

    @Delete(':slug')
    @ApiOperation({
        summary: 'Exclui uma readlist',
        description: 'Deleta uma readlist por slug do usuário autenticado'
    })
    @ApiResponse({
        status: 200,
        description: 'Readlist removida com sucesso'
    })
    @ApiResponse({
        status: 404,
        description: 'Readlist não encontrada'
    })
    @ApiResponse({
        status: 401,
        description: 'Sessão inválida'
    })
    async remove(@CurrentUser() user: CurrentUserDto, @Param('slug') slug: string) {
        return this.readlistsService.remove(user.userId, slug);
    }

    @Get('public/:username')
    @ApiOperation({ 
        summary: 'Lista readlists públicas de um usuário',
        description: 'Retorna todas readlists públicas de um usuário por username para um usuário autenticado'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de readlists públicas retornada com sucesso'
    })
    @ApiResponse({
        status: 401,
        description: 'Sessão inválida'
    })
    async findAllPublic(@Param('username') username: string) {
        return this.readlistsService.findAllPublic(username);
    }

    @Get('public/:username/:slug')
    @ApiOperation({ 
        summary: 'Lista uma readlist pública de um usuário por username e slug',
        description: 'Retorna toda readlist pública de um usuário por username para um usuário autenticado'
    })
    @ApiResponse({
        status: 200,
        description: 'Readlist pública retornada com sucesso'
    })
    @ApiResponse({
        status: 404,
        description: 'Readlist não encontrada'
    })
    @ApiResponse({
        status: 401,
        description: 'Sessão inválida'
    })
    async findOnePublic(@Param('username') username: string, @Param('slug') slug: string) {
        return this.readlistsService.findOnePublic(username, slug);
    }

    @Patch(':id/livros/:livroId')
    @ApiOperation({
        summary: 'Adiciona um livro na readlist',
        description: 'Adiciona um livro por ID na readlist por ID do usuário autenticado'
    })
    @ApiResponse({
        status: 200,
        description: 'Livro adicionado com sucesso na readlist'
    })
    @ApiResponse({
        status: 404,
        description: 'Readlist não encontrada'
    })
    @ApiResponse({
        status: 400,
        description: 'ID inválido'
    })
    @ApiResponse({
        status: 401,
        description: 'Token JWT inválido'
    })
    async addLivro(@CurrentUser() user: CurrentUserDto, @Param('id') id: string, @Param('livroId') livroId: string) {
        return this.readlistsService.addLivro(user.userId, id, livroId);
    }

    @Delete(':id/livros/:livroId')
    @ApiOperation({
        summary: 'Remove um livro da readlist',
        description: 'Deleta um livro por ID da readlist por ID do usuário autenticado'
    })
    @ApiResponse({
        status: 200,
        description: 'Livro removido com sucesso da readlist'
    })
    @ApiResponse({
        status: 404,
        description: 'Readlist não encontrada'
    })
    @ApiResponse({
        status: 400,
        description: 'ID inválido'
    })
    @ApiResponse({
        status: 401,
        description: 'Token JWT inválido'
    })
    async removeLivro(@CurrentUser() user: CurrentUserDto, @Param('id') id: string, @Param('livroId') livroId: string) {
        return this.readlistsService.removeLivro(user.userId, id, livroId);
    }
}
