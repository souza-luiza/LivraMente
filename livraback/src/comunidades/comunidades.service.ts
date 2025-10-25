import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comunidade, ComunidadeDocument } from './entities/comunidade.entity';
import { Model } from 'mongoose';

@Injectable()
export class ComunidadesService {
    constructor(@InjectModel(Comunidade.name) private readonly comunidadeModel: Model<ComunidadeDocument>) {}

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
            const removed = await this.comunidadeModel.findOneAndUpdate(
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

            if (!removed) throw new NotFoundException('Comunidade não encontrada');
            
            return { message: 'Usuário removido da comunidade com sucesso' };

        } catch (error) {
            if (error.name === 'CastError') throw new BadRequestException('ID inválido');

            throw error;
        }
    }
}
