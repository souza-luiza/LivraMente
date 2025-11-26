import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService) {}

    @Get()
    @ApiOperation({
        summary: 'Busca usuários, comunidades, readlists e livros de acordo com busca',
        description: 'Lista melhor resultado e usuários, comunidades, readlists e livros relacionados de acordo com busca do usuário'
    })
    @ApiResponse({
        status: 200,
        description: 'Melhor resultado e lista de usuários, comunidades, readlists e livros relacionados retornados com sucesso'
    })
    async search(@Query('q') q: string) {
        return this.searchService.search(q);
    }
}
