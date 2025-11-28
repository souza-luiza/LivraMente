import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comunidade, ComunidadeDocument } from './entities/comunidade.entity';
import { Post } from '../schemas/post.schema';
import { Model } from 'mongoose';
import { CreateComunidadeDto } from './dto/create-comunidade.dto';
import { UpdateComunidadeDto } from './dto/update-comunidade.dto';

@Injectable()
export class ComunidadesService {
    constructor(
        @InjectModel(Comunidade.name) private readonly comunidadeModel: Model<ComunidadeDocument>,
        @InjectModel(Post.name) private postModel: Model<Post>
) {}

    async findAll() {
        return await this.comunidadeModel.find().exec();
    }

    async findOne(comunidadeNome: string) {
        // Tenta buscar por slug primeiro, depois por nome
        const comunidade = await this.comunidadeModel.findOne({
            $or: [
                { slug: comunidadeNome },
                { nome: comunidadeNome }
            ]
        });

        if (!comunidade) {
            throw new NotFoundException(`Comunidade "${comunidadeNome}" não encontrada`);
        }

        return comunidade;
    }

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

        if(updateComunidadeDto.nome){
            const existingComunidade = await this.comunidadeModel.findOne({ nome: updateComunidadeDto.nome }).exec();
            if(existingComunidade) throw new ConflictException('Nome de comunidade em uso');
        }
        
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
        const comunidade = await this.comunidadeModel
            .findOne({ nome: comunidadeNome })
            .populate({ path: 'posts', options: {sort: { createdAt: -1 }}, populate: [{ path: 'comunidade', select: 'nome'}, { path: 'autor', select: 'username avatarUrl' }]})
            .exec();
        if (!comunidade) throw new NotFoundException('Comunidade não encontrada');
        return comunidade.posts;
    }

    async findAllComunidadeMembros(comunidadeNome: string) {
        const comunidade = await this.comunidadeModel.findOne({ nome: comunidadeNome }).populate('membros').exec();
        if (!comunidade) throw new NotFoundException('Comunidade não encontrada');
        return comunidade.membros;
    }

    async findAllComunidadeModeradores(comunidadeNome: string) {
        const comunidade = await this.comunidadeModel.findOne({ nome: comunidadeNome }).populate('moderadores').exec();
        if (!comunidade) throw new NotFoundException('Comunidade não encontrada');
        return comunidade.moderadores;
    }

    async verifyMemberOrMod(userId: string, comunidadeNome: string) {
        if (!userId) throw new UnauthorizedException('Usuário não autenticado');

        const comunidade = await this.comunidadeModel.findOne({ nome: comunidadeNome }).select('membros moderadores').exec();
        if(!comunidade) throw new NotFoundException('Comunidade não encontrada');

        const membros = comunidade.membros.map((m) => m.toString());
        const isMember = membros.includes(userId);

        const moderadores = comunidade.moderadores.map((m) => m.toString());
        const isModerator = moderadores.includes(userId);

        return { isMember, isModerator };
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

    async removerMembroComoModerador(requesterId: string, comunidadeNome: string, targetUserId: string) {
        const comunidade = await this.comunidadeModel.findOne({ nome: comunidadeNome }).exec();
        if (!comunidade) throw new NotFoundException('Comunidade não encontrada');

        const isRequesterModerator = comunidade.moderadores.some((m) => m.toString() === requesterId);
        if (!isRequesterModerator) throw new ForbiddenException('Apenas moderadores podem remover membros da comunidade');

        const isTargetMember = comunidade.membros.some((m) => m.toString() === targetUserId);
        if (!isTargetMember) throw new BadRequestException('O usuário alvo não é membro da comunidade');

        const isTargetModerator = comunidade.moderadores.some((m) => m.toString() === targetUserId);
        if (isTargetModerator) throw new ForbiddenException('Moderadores não podem remover outros moderadores');

        await this.comunidadeModel.findOneAndUpdate(
            { nome: comunidadeNome },
            { $pull: { membros: targetUserId } },
            { new: true }
        ).exec();

        return { message: 'Membro removido da comunidade com sucesso' };
    }

    async tornarMembroModerador(requesterId: string, comunidadeNome: string, targetUserId: string) {
        const comunidade = await this.comunidadeModel.findOne({ nome: comunidadeNome }).exec();
        if (!comunidade) throw new NotFoundException('Comunidade não encontrada');

        const isRequesterModerator = comunidade.moderadores.some((m) => m.toString() === requesterId);
        if (!isRequesterModerator) throw new ForbiddenException('Apenas moderadores podem tornar membros em moderadores');

        const isTargetMember = comunidade.membros.some((m) => m.toString() === targetUserId);
        if (!isTargetMember) throw new BadRequestException('O usuário alvo não é membro da comunidade');

        const isTargetModerator = comunidade.moderadores.some((m) => m.toString() === targetUserId);
        if (isTargetModerator) throw new ConflictException('O usuário alvo já é um moderador');

        await this.comunidadeModel.findOneAndUpdate(
            { nome: comunidadeNome },
            { $addToSet: { moderadores: targetUserId } },
            { new: true }
        ).exec();

        return { message: 'Membro promovido a moderador com sucesso' };
    }

    async deleteCommunity(userId: string, comunidadeNome: string) {
        const comunidade = await this.comunidadeModel.findOne({ nome: comunidadeNome }).exec();
        if(!comunidade) throw new NotFoundException('Comunidade não encontrada');

        const isModerator = comunidade.moderadores.some((m) => m.toString() === userId);
        if (!isModerator) throw new ForbiddenException('Apenas moderadores podem apagar a comunidade');

        await this.postModel.deleteMany({ comunidade: comunidade._id });

        await comunidade.deleteOne();
        
        return { message: 'Comunidade apagada com sucesso' };
    }
}
