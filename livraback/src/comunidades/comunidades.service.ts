import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comunidade, ComunidadeDocument } from './entities/comunidade.entity';
import { Model } from 'mongoose';
import { CreateComunidadeDto } from './dto/create-comunidade.dto';
import { UpdateComunidadeDto } from './dto/update-comunidade.dto';

@Injectable()
export class ComunidadesService {
    constructor(@InjectModel(Comunidade.name) private readonly comunidadeModel: Model<ComunidadeDocument>) {}

    async create(criadorId: string, createComunidadeDto: CreateComunidadeDto) {
        const existingComunidade = await this.comunidadeModel.findOne({ nome: createComunidadeDto.nome }).exec();
        if (existingComunidade) throw new ConflictException('Nome de comunidade em uso');
        const comunidade = new this.comunidadeModel({...createComunidadeDto, moderadores: [criadorId], membros: [criadorId]});
        return await comunidade.save();
    }

    async update(userId: string, comunidadeNome: string, updateComunidadeDto: UpdateComunidadeDto) {
        const comunidade = await this.comunidadeModel.findOne({ nome: comunidadeNome }).exec();
        if(!comunidade) throw new NotFoundException('Comunidade não encontrada');

        const moderadores = comunidade.moderadores.map((m) => m.toString());
        if(!moderadores.includes(userId)) throw new UnauthorizedException('Apenas o moderador pode editar a comunidade');

        const existingComunidade = await this.comunidadeModel.findOne({ nome: updateComunidadeDto.nome }).exec();
        if(existingComunidade) throw new ConflictException('Nome de comunidade em uso');

        const updated = await this.comunidadeModel.findOneAndUpdate(
            {
                nome: comunidadeNome
            },
            {
                $set: updateComunidadeDto
            },
            {
                new: true,
                runValidators: true
            }
        ).exec();
        return updated;
    }

    async findAllPosts(comunidadeNome: string) {
        const comunidade = await this.comunidadeModel.findOne({ nome: comunidadeNome }).populate('posts').exec();
        if (!comunidade) throw new NotFoundException('Comunidade não encontrada');
        return comunidade.posts;
    }

    async findAllComunidadeMembros(comunidadeNome: string) {
        const comunidade = await this.comunidadeModel.findOne({ nome: comunidadeNome }).populate('membros').exec();
        if (!comunidade) throw new NotFoundException('Comunidade não encontrada');
        return comunidade.membros;
    }

    async addMembro(userId: string, comunidadeNome: string) {
        try {
            const updated = await this.comunidadeModel.findOneAndUpdate(
                {
                    nome: comunidadeNome
                },
                {
                    $addToSet: { membros: userId }
                },
                {
                    new: true,
                    runValidators: true
                }
            ).exec();

            if (!updated) throw new NotFoundException('Comunidade não encontrada');
            
            return { message: 'Usuário adicionado à comunidade com sucesso' };

        } catch(error) {
            if (error.name === 'CastError') throw new BadRequestException('ID inválido');
            
            throw error;
        }
    }

    async removeMembro(userId: string, comunidadeNome: string) {
        try {
            const comunidade = await this.comunidadeModel.findOne({ nome: comunidadeNome }).exec();
            if(!comunidade) throw new NotFoundException('Comunidade não encontrada');

            const moderadores = comunidade.moderadores.map((m) => m.toString());
            const isModerador = moderadores.includes(userId);
            if(isModerador && comunidade.moderadores.length === 1) throw new BadRequestException('Não é possível remover o único moderador da comunidade');

            if(isModerador) {
                await this.comunidadeModel.findOneAndUpdate(
                    {
                        nome: comunidadeNome
                    },
                    {
                        $pull: { moderadores: userId }
                    },
                    {
                        new: true
                    }
                ).exec();
            }

            await this.comunidadeModel.findOneAndUpdate(
                {
                    nome: comunidadeNome
                },
                {
                    $pull: { membros: userId }
                },
                {
                    new: true
                }
            ).exec();
            
            return { message: 'Usuário removido da comunidade com sucesso' };

        } catch (error) {
            if (error.name === 'CastError') throw new BadRequestException('ID inválido');

            throw error;
        }
    }
}
