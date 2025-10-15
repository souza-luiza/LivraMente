import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentUserDto } from '../auth/dto/current-user.dto';
import { ReadlistsService } from './readlists.service';
import { CreateReadlistDto } from './dto/create-readlist.dto';
import { UpdateReadlistDto } from './dto/update-readlist.dto';

@UseGuards(JwtAuthGuard)
@Controller('readlists')
export class ReadlistsController {
    constructor(private readonly readlistsService: ReadlistsService) {}

    @Post()
    async create(@CurrentUser() user: CurrentUserDto, @Body() createReadlistDto: CreateReadlistDto) {
        return this.readlistsService.create(user.userId, createReadlistDto);
    }

    @Get()
    async findAll(@CurrentUser() user: CurrentUserDto) {
        return this.readlistsService.findAll(user.userId);
    }

    @Get(':id')
    async findOne(@CurrentUser() user: CurrentUserDto, @Param('id') id: string) {
        return this.readlistsService.findOne(user.userId, id);
    }

    @Patch(':id')
    async update(@CurrentUser() user: CurrentUserDto, @Param('id') id: string, @Body() updateReadlistDto: UpdateReadlistDto) {
        return this.readlistsService.update(user.userId, id, updateReadlistDto);
    }

    @Delete(':id')
    async remove(@CurrentUser() user: CurrentUserDto, @Param('id') id: string) {
        return this.readlistsService.remove(user.userId, id);
    }
}
