import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ComunidadesService } from './comunidades.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CurrentUserDto } from 'src/auth/dto/current-user.dto';
import { CreateComunidadeDto } from './dto/create-comunidade.dto';
import { UpdateComunidadeDto } from './dto/update-comunidade.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('comunidades')
export class ComunidadesController {
    constructor(private readonly comunidadesService: ComunidadesService) {}

    @Post()
    @ApiOperation({
        summary: 'Cria uma nova comunidade',
        description: 'Cria nova comunidade, tornando o usuário autenticado moderador'
    })
    @ApiResponse({
        status: 201,
        description: 'Comunidade criada com sucesso',
        type: CreateComunidadeDto
    })
    @ApiResponse({
        status: 409,
        description: 'Nome de comunidade em uso'
    })
    @ApiResponse({
        status: 401,
        description: 'Token JWT inválido'
    })
    async create(@CurrentUser() user: CurrentUserDto, @Body() createComunidadeDto: CreateComunidadeDto) {
        return this.comunidadesService.create(user.userId, createComunidadeDto);
    }

    @Patch(':comunidadeNome')
    @ApiOperation({
        summary: 'Atualiza uma comunidade',
        description: 'Atualiza dados de uma comunidade por nome, sendo o usuário autenticado um moderador'
    })
    @ApiResponse({
        status: 200,
        description: 'Dados da comunidade atualizados com sucesso'
    })
    @ApiResponse({
        status: 404,
        description: 'Comunidade não encontrada'
    })
    @ApiResponse({
        status: 409,
        description: 'Nome da comunidade em uso'
    })
    @ApiResponse({
        status: 401,
        description: 'Token JWT inválido'
    })
    async update(@CurrentUser() user: CurrentUserDto, @Param('comunidadeNome') comunidadeNome: string, @Body() updateComunidadeDto: UpdateComunidadeDto) {
        return this.comunidadesService.update(user.userId, comunidadeNome, updateComunidadeDto);
    }

    @Get(':comunidadeNome/posts')
    @ApiOperation({
        summary: 'Lista todos os posts',
        description: 'Retorna todos os posts de uma comunidade pelo nome da comunidade'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de posts retornada com sucesso'
    })
    @ApiResponse({
        status: 404,
        description: 'Comunidade não encontrada'
    })
    @ApiResponse({
        status: 401,
        description: 'Token JWT inválido'
    })
    async findAllPosts(@Param('comunidadeNome') comunidadeNome: string) {
        return this.comunidadesService.findAllPosts(comunidadeNome);
    }

    @Get(':comunidadeNome/membros')
    @ApiOperation({
        summary: 'Lista todos os membros',
        description: 'Retorna todos os membros de uma comunidade pelo nome da comunidade'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de membros retornada com sucesso'
    })
    @ApiResponse({
        status: 404,
        description: 'Comunidade não encontrada'
    })
    @ApiResponse({
        status: 401,
        description: 'Token JWT inválido'
    })
    async findAllComunidadeMembros(@Param('comunidadeNome') comunidadeNome: string) {
        return this.comunidadesService.findAllComunidadeMembros(comunidadeNome);
    }

    @Patch(':comunidadeNome/membros')
    @ApiOperation({
        summary: 'Adiciona usuário autenticado na comunidade',
        description: 'Adiciona usuário autenticado na comunidade pelo nome da comunidade'
    })
    @ApiResponse({
        status: 200,
        description: 'Membro adicionado com sucesso'
    })
    @ApiResponse({
        status: 404,
        description: 'Comunidade não encontrada'
    })
    @ApiResponse({
        status: 401,
        description: 'Token JWT inválido'
    })
    async addMembro(@CurrentUser() user: CurrentUserDto, @Param('comunidadeNome') comunidadeNome: string) {
        return this.comunidadesService.addMembro(user.userId, comunidadeNome);
    }

    @Delete(':comunidadeNome/membros')
    @ApiOperation({
        summary: 'Remove usuário autenticado da comunidade',
        description: 'Remove usuário autenticado da comunidade pelo nome da comunidade'
    })
    @ApiResponse({
        status: 200,
        description: 'Membro removido com sucesso'
    })
    @ApiResponse({
        status: 404,
        description: 'Comunidade não encontrada'
    })
    @ApiResponse({
        status: 400,
        description: 'Não é possível remover único moderador da comunidade'
    })
    @ApiResponse({
        status: 401,
        description: 'Token JWT inválido'
    })
    async removeMembro(@CurrentUser() user: CurrentUserDto, @Param('comunidadeNome') comunidadeNome: string) {
        return this.comunidadesService.removeMembro(user.userId, comunidadeNome);
    }
}
