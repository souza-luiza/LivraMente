import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LivrosService } from './livros.service';

@Controller('livros')
export class LivrosController {
    constructor(private readonly livrosService: LivrosService) {}

    @Get()
    @ApiOperation({ 
        summary: 'Lista todos os livros',
        description: 'Retorna todos os livros existentes'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de livros retornada com sucesso'
    })
    async findAll() {
        return this.livrosService.findAll();
    }

    @Get(':slug')
    @ApiOperation({
        summary: 'Busca um livro por slug',
        description: 'Retorna detalhes de um livro por slug'
    })
    @ApiResponse({
        status: 200,
        description: 'Detalhes do livro retornados com sucesso'
    })
    @ApiResponse({
        status: 404,
        description: 'Livro não encontrado'
    })
    async findOne(@Param('slug') slug: string) {
        return this.livrosService.findOne(slug);
    }

    @Get(':slug/readlists')
    @ApiOperation({
        summary: 'Busca readlists relacionadas a um livro pela slug do livro',
        description: 'Retorna detalhes de readlists relacionadas a um livro por slug'
    })
    @ApiResponse({
        status: 200,
        description: 'Detalhes das readlists relacionadas ao livro retornados com sucesso'
    })
    @ApiResponse({
        status: 404,
        description: 'Livro não encontrado'
    })
    async findOneReadlists(@Param('slug') slug: string) {
        return this.livrosService.findOneReadlists(slug);
    }

    @Get(':slug/comunidades')
    @ApiOperation({
        summary: 'Busca comunidades relacionadas a um livro pela slug do livro',
        description: 'Retorna detalhes de comunidades relacionadas a um livro por slug'
    })
    @ApiResponse({
        status: 200,
        description: 'Detalhes das comunidades relacionadas ao livro retornados com sucesso'
    })
    @ApiResponse({
        status: 404,
        description: 'Livro não encontrado'
    })
    async findOneComunidades(@Param('slug') slug: string) {
        return this.livrosService.findOneComunidades(slug);
    }
}
