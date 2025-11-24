import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ComunidadesService } from './comunidades.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentUserDto } from '../auth/dto/current-user.dto';
import { CreateComunidadeDto } from './dto/create-comunidade.dto';
import { UpdateComunidadeDto } from './dto/update-comunidade.dto';
import { SessionAuthGuard } from 'src/auth/guards/session-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@ApiBearerAuth()
@UseGuards(SessionAuthGuard)
@Controller('comunidades')
export class ComunidadesController {
    constructor(private readonly comunidadesService: ComunidadesService) {}

    @Get()
    @ApiOperation({ 
        summary: 'Lista todas as comunidades',
        description: 'Retorna todas comunidades existentes'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de comunidades retornada com sucesso'
    })
    @ApiResponse({
        status: 401,
        description: 'Token JWT inválido'
    })
    async findAll() {
        return this.comunidadesService.findAll();
    }

    @Get(':comunidadeNome')
    @ApiOperation({ 
        summary: 'Busca uma comunidade pelo nome',
        description: 'Retorna os detalhes de uma comunidade específica pelo nome informado'
    })
    @ApiResponse({
        status: 200,
        description: 'Comunidade retornada com sucesso'
    })
    @ApiResponse({
        status: 404,
        description: 'Comunidade não encontrada'
    })
    @ApiResponse({
        status: 401,
        description: 'Token JWT inválido'
    })
    async findOne(@Param('comunidadeNome') comunidadeNome: string) {
        return this.comunidadesService.findOne(comunidadeNome);
    }

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

    @Get(':comunidadeNome/moderadores')
    @ApiOperation({
        summary: 'Lista todos os moderadores',
        description: 'Retorna todos os moderadores de uma comunidade pelo nome da comunidade'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de moderadores retornada com sucesso'
    })
    @ApiResponse({
        status: 404,
        description: 'Comunidade não encontrada'
    })
    @ApiResponse({
        status: 401,
        description: 'Token JWT inválido'
    })
    async findAllComunidadeModeradores(@Param('comunidadeNome') comunidadeNome: string) {
        return this.comunidadesService.findAllComunidadeModeradores(comunidadeNome);
    }

    @Get('verificar-membro/:comunidadeNome')
    @ApiOperation({
        summary: 'Verifica se o usuário é membro e/ou moderador',
        description: 'Verifica se o usuário autenticado é membro ou moderador de uma comunidade'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Status de membership retornado com sucesso',
    })
    @ApiResponse({
        status: 404,
        description: 'Comunidade não encontrada'
    })
    @ApiResponse({
        status: 401,
        description: 'Token JWT inválido'
    })
    async verificarMembro(@Param('comunidadeNome') comunidadeNome: string, @CurrentUser() user: CurrentUserDto) {
        return this.comunidadesService.verifyMemberOrMod(user.userId, comunidadeNome);
    }

    @Patch(':comunidadeNome/membros')
    @ApiOperation({
        summary: 'Adiciona usuário autenticado na comunidade',
        description: 'Faz usuário autenticado entrar na comunidade pelo nome da comunidade'
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
        description: 'Faz usuário autenticado sair da comunidade pelo nome da comunidade'
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

    @Delete(':comunidadeNome/membros/:targetUserId')
    @ApiOperation({ 
        summary: 'Remove um membro da comunidade',
        description: 'Permite que um moderador remova um membro específico (que não seja moderador) da comunidade pelo nome da comunidade e ID do usuário alvo' 
    })
     @ApiResponse({
        status: 200,
        description: 'Membro removido com sucesso'
    })
    @ApiResponse({
        status: 400,
        description: 'Usuário alvo não é membro da comunidade',
    })
    @ApiResponse({
        status: 401,
        description: 'Token JWT inválido'
    })
    @ApiResponse({
        status: 403,
        description: 'Usuário não é moderador ou tentou remover outro moderador',
    })
    @ApiResponse({
        status: 404,
        description: 'Comunidade não encontrada'
    })
    async removerMembroComoModerador(@CurrentUser() user: CurrentUserDto, @Param('comunidadeNome') comunidadeNome: string, @Param('targetUserId') targetUserId: string) {
        return this.comunidadesService.removerMembroComoModerador(user.userId, comunidadeNome, targetUserId);
    }

    @Patch(':comunidadeNome/membros/:targetUserId/tornar-moderador')
    @ApiOperation({ 
        summary: 'Torna um membro moderador da comunidade',
        description: 'Permite que um moderador torne um membro específico da comunidade em moderador pelo nome da comunidade e ID do usuário alvo' 
    })
     @ApiResponse({
        status: 200,
        description: 'Membro promovido a moderador com sucesso'
    })
    @ApiResponse({
        status: 400,
        description: 'Usuário alvo não é membro da comunidade',
    })
    @ApiResponse({
        status: 401,
        description: 'Token JWT inválido'
    })
    @ApiResponse({
        status: 403,
        description: 'Usuário não é moderador',
    })
    @ApiResponse({
        status: 404,
        description: 'Comunidade não encontrada'
    })
    @ApiResponse({
        status: 409,
        description: 'Usuário alvo já é moderador da comunidade',
    })
    async tornarMembroModerador(@CurrentUser() user: CurrentUserDto, @Param('comunidadeNome') comunidadeNome: string, @Param('targetUserId') targetUserId: string) {
        return this.comunidadesService.tornarMembroModerador(user.userId, comunidadeNome, targetUserId);
    }

    @Delete(':comunidadeNome')
    @ApiOperation({
        summary: 'Apaga uma comunidade',
        description: 'Apaga uma comunidade pelo nome, sendo o usuário autenticado um moderador'
    })
    @ApiResponse({
        status: 200,
        description: 'Comunidade apagada com sucesso'
    })
    @ApiResponse({
        status: 403,
        description: 'Usuário não é moderador'
    })
    @ApiResponse({
        status: 404,
        description: 'Comunidade não encontrada'
    })
    async delete(@CurrentUser() user: CurrentUserDto, @Param('comunidadeNome') comunidadeNome: string) {
        return this.comunidadesService.deleteCommunity(user.userId, comunidadeNome);
    }

    @Patch(':comunidadeNome/capa')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: memoryStorage(),
            fileFilter: (req, file, cb) => {
            if (!file) return cb(null, true);
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
            const ok = allowedTypes.includes(file.mimetype);
            if (!ok) return cb(new BadRequestException('Formato de imagem inválido'), false);
            cb(null, true);
            },
            limits: {
            fileSize: 5 * 1024 * 1024,
            },
        }),
    )
    @ApiOperation({
        summary: 'Faz upload da capa da comunidade',
        description: 'Faz upload da capa da comunidade pelo nome, sendo o usuário autenticado um moderador'
    })
    @ApiResponse({
        status: 200,
        description: 'Capa da comunidade atualizada com sucesso'
    })
    @ApiResponse({
        status: 400,
        description: 'Arquivo inválido'
    })
    @ApiResponse({
        status: 403,
        description: 'Usuário não é moderador'
    })
    @ApiResponse({
        status: 404,
        description: 'Comunidade não encontrada'
    })
    async uploadCapa(@CurrentUser() user: CurrentUserDto, @Param('comunidadeNome') comunidadeNome: string, @UploadedFile() file: Express.Multer.File) {
        return this.comunidadesService.uploadCapa(user.userId, comunidadeNome, file);
    }

    @Patch(':comunidadeNome/banner')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: memoryStorage(),
            fileFilter: (req, file, cb) => {
            if (!file) return cb(null, true);
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
            const ok = allowedTypes.includes(file.mimetype);
            if (!ok) return cb(new BadRequestException('Formato de imagem inválido'), false);
            cb(null, true);
            },
            limits: {
            fileSize: 5 * 1024 * 1024,
            },
        }),
    )
    @ApiOperation({
        summary: 'Faz upload do banner da comunidade',
        description: 'Faz upload do banner da comunidade pelo nome, sendo o usuário autenticado um moderador'
    })
    @ApiResponse({
        status: 200,
        description: 'Banner da comunidade atualizado com sucesso'
    })
    @ApiResponse({
        status: 400,
        description: 'Arquivo inválido'
    })
    @ApiResponse({
        status: 403,
        description: 'Usuário não é moderador'
    })
    @ApiResponse({
        status: 404,
        description: 'Comunidade não encontrada'
    })
    async uploadBanner(@CurrentUser() user: CurrentUserDto, @Param('comunidadeNome') comunidadeNome: string, @UploadedFile() file: Express.Multer.File) {
        return this.comunidadesService.uploadBanner(user.userId, comunidadeNome, file);
    }
}