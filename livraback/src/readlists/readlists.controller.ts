import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentUserDto } from '../auth/dto/current-user.dto';
import { ReadlistsService } from './readlists.service';
import { CreateReadlistDto } from './dto/create-readlist.dto';
import { UpdateReadlistDto } from './dto/update-readlist.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiBearerAuth() // informa que usa Bearer Token
@UseGuards(JwtAuthGuard)
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
    async findAll(@CurrentUser() user: CurrentUserDto) {
        return this.readlistsService.findAll(user.userId);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Busca uma readlist',
        description: 'Retorna detalhes de uma readlist por ID do usuário autenticado'
    })
    @ApiResponse({
        status: 200,
        description: 'Detalhes da Readlist retornados com sucesso'
    })
    @ApiResponse({
        status: 404,
        description: 'Readlist não encontrada'
    })
    async findOne(@CurrentUser() user: CurrentUserDto, @Param('id') id: string) {
        return this.readlistsService.findOne(user.userId, id);
    }

    @Patch(':id')
    @ApiOperation({
        summary: 'Atualiza uma readlist',
        description: 'Atualiza dados de uma readlist por ID do usuário autenticado'
    })
    @ApiResponse({
        status: 200,
        description: 'Detalhes da Readlist atualizados com sucesso'
    })
    @ApiResponse({
        status: 404,
        description: 'Readlist não encontrada'
    })
    async update(@CurrentUser() user: CurrentUserDto, @Param('id') id: string, @Body() updateReadlistDto: UpdateReadlistDto) {
        return this.readlistsService.update(user.userId, id, updateReadlistDto);
    }

    @Delete(':id')
    @ApiOperation({
        summary: 'Exclui uma readlist',
        description: 'Deleta uma readlist por ID do usuário autenticado'
    })
    @ApiResponse({
        status: 200,
        description: 'Readlist removida com sucesso'
    })
    @ApiResponse({
        status: 404,
        description: 'Readlist não encontrada'
    })
    async remove(@CurrentUser() user: CurrentUserDto, @Param('id') id: string) {
        return this.readlistsService.remove(user.userId, id);
    }
    // Busca readlists públicas de um usuário pelo username
    @Get('user/:username')
    async findByUsername(@Param('username') username: string) {
        return this.readlistsService.findPublicByUsername(username);
    }
    // Busca readlists favoritedas por um usuário
    @Get('favorited/:userId')
    async findFavoritedByUser(@Param('userId') userId: string) {
        return this.readlistsService.findFavoritedByUser(userId);
    }
}
