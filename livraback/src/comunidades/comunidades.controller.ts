import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
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
    async create(@CurrentUser() user: CurrentUserDto, @Body() createComunidadeDto: CreateComunidadeDto) {
        return this.comunidadesService.create(user.userId, createComunidadeDto);
    }

    @Patch(':comunidadeNome')
    async update(@CurrentUser() user: CurrentUserDto, @Param('comunidadeNome') comunidadeNome: string, @Body() updateComunidadeDto: UpdateComunidadeDto) {
        return this.comunidadesService.update(user.userId, comunidadeNome, updateComunidadeDto);
    }

    @Get(':comunidadeNome/posts')
    async findAllPosts(@Param('comunidadeNome') comunidadeNome: string) {
        return this.comunidadesService.findAllPosts(comunidadeNome);
    }

    @Get(':comunidadeNome/membros')
    async findAllComunidadeMembros(@Param('comunidadeNome') comunidadeNome: string) {
        return this.comunidadesService.findAllComunidadeMembros(comunidadeNome);
    }

    @Patch(':comunidadeNome/membros')
    async addMembro(@CurrentUser() user: CurrentUserDto, @Param('comunidadeNome') comunidadeNome: string) {
        return this.comunidadesService.addMembro(user.userId, comunidadeNome);
    }

    @Delete(':comunidadeNome/membros')
    async removeMembro(@CurrentUser() user: CurrentUserDto, @Param('comunidadeNome') comunidadeNome: string) {
        return this.comunidadesService.removeMembro(user.userId, comunidadeNome);
    }
}
