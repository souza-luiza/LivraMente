import { Controller, Get, Body, Patch, Param, Delete, Put, UseGuards, UseInterceptors, UploadedFile, BadRequestException, Session } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentUserDto } from '../auth/dto/current-user.dto';
import { ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegistroLeituraDto } from './dto/registro-leitura.dto';
import { memoryStorage } from 'multer';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';

@ApiCookieAuth()
@UseGuards(SessionAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':username')
  @ApiOperation({
    summary: 'Retorna os dados de um usuário',
    description: 'Retorna os dados de um usuário por username'
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
    description: 'Sessão inválida'
  })
  async getProfile(@Param('username') username: string) {
    return this.usersService.findOneUser(username);
  }

  @Patch('profile')
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
    status: 401,
    description: 'Sessão inválida'
  })
  async updateProfile(@CurrentUser() user: CurrentUserDto, @Body() updateUserDto: UpdateUserDto, @Session() session: Record<string, any>) {
    return this.usersService.update(user.userId, updateUserDto, session);
  }

  @Put('avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        const ok = allowedTypes.includes(file.mimetype);
        if (!ok) return cb(new BadRequestException('Formato de imagem inválido'), false);
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  @ApiOperation({ 
    summary: 'Upload de imagem de perfil do usuário',
    description: 'Atualiza a foto de perfil do usuário autenticado'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Imagem de perfil atualizada com sucesso' 
  })
  @ApiResponse({
    status: 400,
    description: 'Arquivo inválido' 
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado' 
  })
  @ApiResponse({
    status: 401,
    description: 'Sessão inválida'
  })
  async updateAvatar(@CurrentUser() user: CurrentUserDto, @UploadedFile() file: Express.Multer.File, @Session() session: Record<string, any>) {
    if (!file) throw new BadRequestException('Nenhum arquivo foi enviado');
    return this.usersService.updateAvatar(user.userId, file, session);
  }

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

  @Patch('me/favoritar/:username/:readlistSlug')
  @ApiOperation({
    summary: 'Favorita uma readlist pública de acordo com username dono da readlist e readlist slug',
    description: 'Adiciona uma readlist pública na lista de favoritos do usuário autenticado'
  })
  @ApiResponse({
    status: 200,
    description: 'Readlist favoritada com sucesso'
  })
  @ApiResponse({
    status: 404,
    description: 'Readlist ou usuário não encontrado'
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
    description: 'Sessão inválida'
  })
  async favoritarReadlist(@CurrentUser() user: CurrentUserDto, @Param('readlistSlug') readlistSlug: string, @Param('username') username: string) {
    return this.usersService.favoritarReadlist(user.userId, readlistSlug, username);
  }

  @Delete('me/favoritar/:username/:readlistSlug')
  @ApiOperation({
    summary: 'Remove readlist dos favoritos de acordo com username dono da readlist e readlist slug',
    description: 'Remove readlist dos favoritos do usuário autenticado'
  })
  @ApiResponse({
    status: 200,
    description: 'Readlist removida com sucesso'
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário ou readlist não encontrado'
  })
  @ApiResponse({
    status: 401,
    description: 'Sessão inválida'
  })
  async desfavoritarReadlist(@CurrentUser() user: CurrentUserDto, @Param('readlistSlug') readlistSlug: string, @Param('username') username: string) {
    return this.usersService.desfavoritarReadlist(user.userId, readlistSlug, username);
  }

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
    description: 'Sessão inválida'
  })
  async findReadlistsFavoritas(@CurrentUser() user: CurrentUserDto) {
    return this.usersService.findReadlistsFavoritas(user.userId);
  }

  @Get('me/favoritar/:readlistId')
  @ApiOperation({
    summary: 'Verifica se readlist é favoritada',
    description: 'Retorna se a readlist está favoritada pelo usuário autenticado'
  })
  @ApiResponse({
    status: 200,
    description: 'Estado se readlist está favoritada retornado com sucesso'
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado'
  })
  @ApiResponse({
    status: 401,
    description: 'Sessão inválida'
  })
  async checkReadlistFav(@CurrentUser() user: CurrentUserDto, @Param('readlistId') readlistId: string) {
    return this.usersService.checkReadlistFav(user.userId, readlistId);
  }
}
