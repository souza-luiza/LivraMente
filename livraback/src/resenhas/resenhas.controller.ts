import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ResenhasService } from "./resenhas.service";
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { CreateResenhaDto } from "./dto/create-resenha.dto";
import { CurrentUserDto } from "../auth/dto/current-user.dto";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { UpdateResenhaDto } from "./dto/update-resenha.dto";

@ApiTags('Resenhas')
@Controller('resenhas')
export class ResenhasController {
    constructor(private readonly resenhasService: ResenhasService) {}
    
    // Listar todas as resenhas de um livro
    @Get(':bookId')
    @ApiOperation({
        summary: 'Listar resenhas de um livro',
        description: 'Retorna todas as resenhas associadas a um livro específico'
    })
    @ApiResponse({
        status: 200,
        description: 'Resenhas listadas com sucesso'
    })
    @ApiResponse({
        status: 404,
        description: 'Livro não encontrado'
    })
    async getResenhasByBook(@Param('bookId') bookId: string) {
        return this.resenhasService.getResenhasByBook(bookId);
    }

    // Criar resenha
    @UseGuards(SessionAuthGuard)
    @ApiBearerAuth()
    @Post(':bookId')
    @ApiOperation({
        summary: 'Criar resenha',
        description: 'Cria uma nova resenha para um livro específico'
    })
    @ApiResponse({
        status: 201,
        description: 'Resenha criada com sucesso'
    })
    @ApiResponse({
        status: 403,
        description: 'Somente usuários autenticados podem criar resenhas'
    })
    @ApiResponse({
        status: 404,
        description: 'Livro não encontrado'
    })
    async createResenha(@CurrentUser() user: CurrentUserDto, @Param('bookId') bookId: string, @Body() createResenhaDto: CreateResenhaDto) {
        return this.resenhasService.createResenha(user.userId, bookId, createResenhaDto);
    }

    // Atualizar resenha
    @UseGuards(SessionAuthGuard)
    @ApiBearerAuth()
    @Patch(':resenhaId')
    @ApiOperation({
        summary: 'Atualizar resenha',
        description: 'Atualiza uma resenha específica pelo seu ID'
    })
    @ApiResponse({
        status: 200,
        description: 'Resenha atualizada com sucesso'
    })
    @ApiResponse({
        status: 403,
        description: 'Somente o autor da resenha pode atualizá-la'
    })
    @ApiResponse({
        status: 404,
        description: 'Resenha não encontrada'
    })
    async updateResenha(@CurrentUser() user: CurrentUserDto, @Param('resenhaId') resenhaId: string, @Body() updateResenhaDto: UpdateResenhaDto) {
        return this.resenhasService.updateResenha(user.userId, resenhaId, updateResenhaDto);
    }

    // Apagar resenha
    @UseGuards(SessionAuthGuard)
    @ApiBearerAuth()
    @Delete(':resenhaId')
    @ApiOperation({
        summary: 'Apagar resenha',
        description: 'Apaga uma resenha específica pelo seu ID'
    })
    @ApiResponse({
        status: 200,
        description: 'Resenha apagada com sucesso'
    })
    @ApiResponse({
        status: 403,
        description: 'Somente o autor da resenha pode apagá-la'
    })
    @ApiResponse({
        status: 404,
        description: 'Livro ou Resenha não encontrados'
    })
    async deleteResenha(@CurrentUser() user: CurrentUserDto, @Param('resenhaId') resenhaId: string) {
        return this.resenhasService.deleteResenha(user.userId, resenhaId);
    }

    // Buscar uma resenha por ID
    @Get('unico/:resenhaId')
    @ApiOperation({
        summary: 'Buscar resenha por ID',
        description: 'Retorna uma resenha específica pelo seu ID.'
    })
    @ApiResponse({
        status: 200,
        description: 'Resenha encontrada'
    })
    @ApiResponse({
        status: 404,
        description: 'Resenha não encontrada'
    })
    async getResenha(@Param('resenhaId') resenhaId: string) {
        return this.resenhasService.getResenhaById(resenhaId);
    }
}