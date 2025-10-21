import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentUserDto } from '../auth/dto/current-user.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegistroLeituraDto } from './dto/registro-leitura.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({
    summary: 'Retorna os dados do usuário',
    description: 'Retorna os dados do usuário autenticado'
  })
  @ApiResponse({
    status: 200,
    description: 'Dados do usuário retornados com sucesso'
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado'
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT inválido'
  })
  async getProfile(@CurrentUser() user: CurrentUserDto) {
    return this.usersService.findOne(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @ApiOperation({
    summary: 'Atualiza os dados do usuário',
    description: 'Atualiza os dados do usuário autenticado'
  })
  @ApiResponse({
    status: 200,
    description: 'Dados do usuário atualizados com sucesso'
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado'
  })
  @ApiResponse({
    status: 409,
    description: 'Email ou nome de usuário em uso'
  })
  @ApiResponse({
    status: 400,
    description: 'Email ou nome de usuário em uso pelo próprio usuário'
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT inválido'
  })
  async updateProfile(@CurrentUser() user: CurrentUserDto, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(user.userId, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/registro-leitura')
  @ApiOperation({
    summary: 'Registra leitura diária',
    description: 'Altera XP do usuário autenticado de acordo com registro de leitura'
  })
  @ApiResponse({
    status: 200,
    description: 'Dados de gamificação do usuário atualizados com sucesso'
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado'
  })
  @ApiResponse({
    status: 400,
    description: 'Corpo da requisição inválido'
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT inválido'
  })
  async registroLeitura(@CurrentUser() user: CurrentUserDto, @Body() registroLeituraDto: RegistroLeituraDto) {
    return this.usersService.registroLeitura(user.userId, registroLeituraDto.opcao, registroLeituraDto.qtd);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/favoritar/:readlistId')
  @ApiOperation({
    summary: 'Favorita uma readlist pública',
    description: 'Adiciona uma readlist pública na lista de favoritos do usuário autenticado'
  })
  @ApiResponse({
    status: 200,
    description: 'Readlist favoritada com sucesso'
  })
  @ApiResponse({
    status: 404,
    description: 'Readlist não encontrada'
  })
  @ApiResponse({
    status: 400,
    description: 'Readlist não é pública ou é do próprio usuário'
  })
  @ApiResponse({
    status: 409,
    description: 'Readlist já favoritada'
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT inválido'
  })
  async favoritarReadlist(@CurrentUser() user: CurrentUserDto, @Param('readlistId') readlistId: string) {
    return this.usersService.favoritarReadlist(user.userId, readlistId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/favoritar/:readlistId')
  @ApiOperation({
    summary: 'Remove readlist dos favoritos',
    description: 'Remove readlist dos favoritos do usuário autenticado'
  })
  @ApiResponse({
    status: 200,
    description: 'Readlist removida com sucesso'
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado'
  })
  @ApiResponse({
    status: 400,
    description: 'ID inválido'
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT inválido'
  })
  async desfavoritarReadlist(@CurrentUser() user: CurrentUserDto, @Param('readlistId') readlistId: string) {
    return this.usersService.desfavoritarReadlist(user.userId, readlistId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/favoritar')
  @ApiOperation({
    summary: 'Retorna readlists favoritas',
    description: 'Retorna readlists favoritas do usuário autenticado'
  })
  @ApiResponse({
    status: 200,
    description: 'Readlists favoritadas retornadas com sucesso'
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado'
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT inválido'
  })
  async findReadlistsFavoritas(@CurrentUser() user: CurrentUserDto) {
    return this.usersService.findReadlistsFavoritas(user.userId);
  }

  /*@Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }*/
}
