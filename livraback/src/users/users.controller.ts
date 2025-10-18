import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentUserDto } from '../auth/dto/current-user.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

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
