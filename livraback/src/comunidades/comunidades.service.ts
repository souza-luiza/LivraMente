import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comunidade, ComunidadeDocument } from './entities/comunidade.entity';
import { Post } from '../schemas/post.schema';
import { Model } from 'mongoose';
import { CreateComunidadeDto } from './dto/create-comunidade.dto';
import { UpdateComunidadeDto } from './dto/update-comunidade.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Logger } from '@nestjs/common';
import { Comentario } from 'src/schemas/comentario.schema';
import { Livro } from 'src/livros/entities/livro.schema';

@Injectable()
export class ComunidadesService {
    private readonly logger = new Logger(ComunidadesService.name);

    constructor(
        @InjectModel(Comunidade.name) private readonly comunidadeModel: Model<ComunidadeDocument>,
        @InjectModel(Post.name) private postModel: Model<Post>,
        @InjectModel(Comentario.name) private comentarioModel: Model<Comentario>,
        @InjectModel(Livro.name) private livroModel: Model<Livro>,
        private readonly cloudinary: CloudinaryService,
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
        const novaComunidade = await comunidade.save();

        if (createComunidadeDto.livro) {
            const livro = await this.livroModel.findById(createComunidadeDto.livro).exec();
            if (!livro) throw new NotFoundException('Livro principal não encontrado');

            await this.livroModel.findByIdAndUpdate(
                createComunidadeDto.livro,
                { $addToSet: { comunidades: novaComunidade._id } },
                { new: true }
            ).exec();
        }

        return novaComunidade;
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

        // Atualiza a referência do livro principal, se necessário
        if(updateComunidadeDto.livro && updateComunidadeDto.livro.toString() !== comunidade.livro?.toString()) {
            const livroAntigo = await this.livroModel.findByIdAndUpdate(
                comunidade.livro,
                { $pull: { comunidades: comunidade._id } },
                { new: true }
            ).exec();
            if (!livroAntigo) throw new NotFoundException('Livro não encontrado');

            const livro = await this.livroModel.findById(
                updateComunidadeDto.livro,
                { $addToSet: { comunidades: comunidade._id } },
                { new: true }
            ).exec();
            if (!livro) throw new NotFoundException('Livro não encontrado');
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

        // Apaga capa e banner da comunidade no Cloudinary, se existirem
        if (comunidade.capaPublicId) {
            await this.cloudinary.deleteImage(comunidade.capaPublicId);
        }
        if (comunidade.bannerPublicId) {
            await this.cloudinary.deleteImage(comunidade.bannerPublicId);
        }

        // Remove a comunidade da lista de comunidades do livro principal, se existir
        if (comunidade.livro) {
            await this.livroModel.findByIdAndUpdate(
                comunidade.livro,
                { $pull: { comunidades: comunidade._id } },
                { new: true }
            ).exec();
        }

        // Encontra todos os posts da comunidade
        const posts = await this.postModel.find(
            { comunidade: comunidade._id },
            { _id: 1 }
        );
        const postIds = posts.map(p => p._id);

        // Encoontra todas as imagens dos comentários da comunidade
        const comentarios = await this.comentarioModel.find(
            { post: { $in: postIds } },
            { imagens: 1 }
        );
        const commentImageIds = comentarios.flatMap(c =>
            c.imagens.map(img => img.public_id)
        );

        // Encoontra todas as imagens dos posts da comunidade
        const postsWithImages = await this.postModel.find(
            { _id: { $in: postIds } },
            { imagens: 1 }
        );
        const postImageIds = postsWithImages.flatMap(p =>
            p.imagens.map(img => img.public_id)
        );

        const allImageIds = [...commentImageIds, ...postImageIds];

        // Apaga todas as imagens associadas aos posts e comentários da comunidade no Cloudinary
        if (allImageIds.length > 0) {
            await Promise.all(
                allImageIds.map(id => this.cloudinary.deleteImage(id))
            );
        }

        // Apaga todos os comentários da comunidade
        await this.comentarioModel.deleteMany({ post: { $in: postIds } });

        // Apaga todos os posts da comunidade
        await this.postModel.deleteMany({ comunidade: comunidade._id });

        // Apaga a comunidade
        await comunidade.deleteOne();
        
        return { message: 'Comunidade apagada com sucesso' };
    }

    async uploadCapa(userId: string, comunidadeNome: string, file?: Express.Multer.File) {
        const comunidade = await this.comunidadeModel.findOne({ nome: comunidadeNome }).exec();
        if(!comunidade) throw new NotFoundException('Comunidade não encontrada');

        const isModerator = comunidade.moderadores.some((m) => m.toString() === userId);
        if (!isModerator) throw new ForbiddenException('Apenas moderadores podem alterar a capa da comunidade');

        // Simples remoção da capa (voltando para a capa padrão)
        if (!file) {
            if (comunidade.capaPublicId) {
                try {
                    await this.cloudinary.deleteImage(comunidade.capaPublicId);
                } catch (err) {
                    this.logger.warn(`Erro ao deletar imagem ${comunidade.capaPublicId} no Cloudinary: ${err.message}`);
                }
            }

            comunidade.capaUrl = '/CommunityDefault.png';
            comunidade.capaPublicId = '';
            await comunidade.save();

            return { capaUrl: comunidade.capaUrl };
        }

        // Upload/Atualização de capa existente
        if (!file.buffer) throw new BadRequestException('Arquivo inválido');

        const uploaded = await this.cloudinary.uploadImage(file.buffer, 'livra/comunidades/capas');

        if (comunidade.capaPublicId) {
            try {
                await this.cloudinary.deleteImage(comunidade.capaPublicId);
            } catch (err) {
                this.logger.warn(`Erro ao deletar imagem ${comunidade.capaPublicId} no Cloudinary: ${err.message}`);
            }
        }

        comunidade.capaUrl = uploaded.secure_url;
        comunidade.capaPublicId = uploaded.public_id;
        await comunidade.save();

        return { capaUrl: comunidade.capaUrl };
    }

    async uploadBanner(userId: string, comunidadeNome: string, file?: Express.Multer.File) {
        const comunidade = await this.comunidadeModel.findOne({ nome: comunidadeNome }).exec();
        if(!comunidade) throw new NotFoundException('Comunidade não encontrada');

        const isModerator = comunidade.moderadores.some((m) => m.toString() === userId);
        if (!isModerator) throw new ForbiddenException('Apenas moderadores podem alterar o banner da comunidade');

        // Simples remoção do banner
        if (!file) {
            if (comunidade.bannerPublicId) {
                try {
                    await this.cloudinary.deleteImage(comunidade.bannerPublicId);
                } catch (err) {
                    this.logger.warn(`Erro ao deletar imagem ${comunidade.bannerPublicId} no Cloudinary: ${err.message}`);
                }
            }

            comunidade.bannerUrl = '';
            comunidade.bannerPublicId = '';
            await comunidade.save();

            return { bannerUrl: comunidade.bannerUrl };
        }

        // Upload/Atualização de banner existente
        if (!file.buffer) throw new BadRequestException('Arquivo inválido');

        const uploaded = await this.cloudinary.uploadImage(file.buffer, 'livra/comunidades/banners');
        if (comunidade.bannerPublicId) {
            try {
                await this.cloudinary.deleteImage(comunidade.bannerPublicId);
            } catch (err) {
                this.logger.warn(`Erro ao deletar imagem ${comunidade.bannerPublicId} no Cloudinary: ${err.message}`);
            }
        }

        comunidade.bannerUrl = uploaded.secure_url;
        comunidade.bannerPublicId = uploaded.public_id;
        await comunidade.save();

        return { bannerUrl: comunidade.bannerUrl};
    }
}
