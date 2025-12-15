import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comunidade } from '../comunidades/entities/comunidade.entity';
import { Comentario } from '../schemas/comentario.schema';
import { Post } from '../schemas/post.schema';
import { User } from '../users/entities/user.entity';
import { CloudinaryImage } from '../cloudinary/entities/image.schema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { QueueProducerService } from '../queue/queue.producer.service';
import { ROUTING_KEYS } from '../queue/queue.constants';

@Injectable()
export class CommentsService {
    constructor(
        @InjectModel(Post.name) private postModel: Model<Post>,
        @InjectModel(Comunidade.name) private comunidadeModel: Model<Comunidade>,
        @InjectModel(Comentario.name) private comentarioModel: Model<Comentario>,
        @InjectModel(User.name) private userModel: Model<User>,
        private readonly cloudinary: CloudinaryService,
        private readonly queueProducer: QueueProducerService,
    ) {}

    async createComment(userId: string, postId: string, createCommentDto: CreateCommentDto, imagens: Express.Multer.File[]) {
        const post = await this.postModel.findById(postId);
        if (!post) throw new NotFoundException('Post não encontrado')

        const comunidade = await this.comunidadeModel.findById(post.comunidade);
        if (!comunidade) throw new NotFoundException('Comunidade não encontrada');

        const isMember = comunidade.membros.some((membroId) => membroId.toString() === userId);
        if (!isMember) throw new ForbiddenException('Usuário não é membro da comunidade');

        if ((imagens && imagens.length > 4) || !createCommentDto.conteudo) {
            throw new BadRequestException('Comentário deve conter texto e no máximo 4 imagens')
        }

        // Upload das imagens para o Cloudinary
        let imagesInfo: CloudinaryImage[] = [];
    
        if (imagens) {
            try {
                imagesInfo = await Promise.all(
                    imagens.map((file) => this.cloudinary.uploadImage(file.buffer, 'livra/comentarios/imagens'))
                );
            } catch (error) {
                await Promise.all(
                    imagesInfo.map(img => this.cloudinary.deleteImage(img.public_id))
                );
                throw new InternalServerErrorException('Falha ao enviar imagens para o servidor');
            }
        }
        
        // Criando comentário
        const comment = new this.comentarioModel({
            conteudo: createCommentDto.conteudo,
            autor: new Types.ObjectId(userId),
            post: new Types.ObjectId(postId),
            curtidas: [],
            imagens: imagesInfo,
        })

        await comment.save();

        // Salvando referência no post
        await this.postModel.findByIdAndUpdate(
            postId,
            { $push: { comentarios: comment._id } }
        )

        // Notificar autor do post sobre novo comentário
        if (post.autor.toString() !== userId) {
            try {
                await this.queueProducer.publish(
                    ROUTING_KEYS.NOTIFICAR_COMENTARIO_CRIADO,
                    {
                        comentarioId: (comment._id as Types.ObjectId).toString(),
                        postId: postId,
                        autorComentarioId: userId,
                        autorPostId: post.autor.toString(),
                        conteudo: createCommentDto.conteudo.substring(0, 100),
                        comunidadeNome: comunidade.nome,
                    }
                );
            } catch (error) {
                console.error('Erro ao publicar notificação de comentário:', error);
            }
        }

        return {
            message: 'Comentário criado com sucesso',
            comment: comment
        }
    }

    async deleteComment(userId: string, commentId: string) {
        const comment = await this.comentarioModel.findById(commentId, 'autor post').populate('post');
        if (!comment) throw new NotFoundException('Comentário não encontrado');

        const post = await this.postModel.findById(comment.post).populate('comunidade');
        if (!post) throw new NotFoundException('Post não encontrado');

        const comunidade = await this.comunidadeModel.findById(post.comunidade._id, 'moderadores');
        if (!comunidade) throw new NotFoundException('Comunidade não encontrada');

        const isOwner = comment.autor.toString() === userId;
        const isModerator = comunidade.moderadores.some((id) => id.toString() === userId);
        if (!isOwner && !isModerator) throw new ForbiddenException('Usuário não é autor do comentário nem moderador da comunidade');

        // Apaga imagens do Cloudinary
        if (comment.imagens && comment.imagens.length > 0) {
            await Promise.all(
                comment.imagens.map(img => this.cloudinary.deleteImage(img.public_id))
            );
        }

        // Apaga comentário 
        await this.comentarioModel.findByIdAndDelete(commentId);

        // Remove referência do comentário no post
        await this.postModel.updateOne(
            { _id: comment.post },
            { $pull: { comentarios: comment._id } }
        );

        return { message: 'Comentário deletado com sucesso' }
    }

    async likeComment(userId: string, commentId: string) {
        const comment = await this.comentarioModel.findById(commentId, 'curtidas')
        if (!comment) throw new NotFoundException('Comentário não encontrado');

        const id = new Types.ObjectId(userId);
        const hasLiked = comment.curtidas.some((likeIds) => likeIds.equals(id));

        if (hasLiked) {
            await this.comentarioModel.updateOne(
                { _id: comment._id },
                { $pull: { curtidas: id }}
            )
        } else {
            await this.comentarioModel.updateOne(
                { _id: comment._id },
                { $addToSet: { curtidas: id } }
            )

            // Notificar autor do comentário sobre curtida
            const fullComment = await this.comentarioModel.findById(commentId).populate({
                path: 'post',
                populate: {
                    path: 'comunidade',
                    select: 'nome'
                }
            });
            if (fullComment && !fullComment.autor.equals(id)) {
                try {
                    const post = fullComment.post as any;
                    const comunidadeNome = post?.comunidade?.nome;

                    await this.queueProducer.publish(
                        ROUTING_KEYS.NOTIFICAR_COMENTARIO_CURTIDO,
                        {
                            comentarioId: commentId,
                            postId: post._id.toString(),
                            userId: userId,
                            autorId: fullComment.autor.toString(),
                            comunidadeNome: comunidadeNome,
                        }
                    );
                } catch (error) {
                    console.error('Erro ao publicar notificação de curtida em comentário:', error);
                }
            }
        }

        const updatedComment = await this.comentarioModel.findById(commentId, 'curtidas');
        if (!updatedComment) throw new NotFoundException('Comentário não encontrado');

        return {
            message: 'Post curtido/descurtido com sucesso',
            liked: !hasLiked,
            likeAmount: updatedComment.curtidas.length
        };
    }

    async updateComment(userId: string, postId: string, commentId: string, updateCommentDto: UpdateCommentDto) {
        const USER_ID = new Types.ObjectId(userId);
        const POST_ID = new Types.ObjectId(postId);
        const COMMENT_ID = new Types.ObjectId(commentId);

        // Procura comentário específico do autor no post específico
        const comment = await this.comentarioModel.findOne({ _id: COMMENT_ID, post: POST_ID, autor: USER_ID });
        if (!comment) throw new NotFoundException('Comentário não encontrado');

        // Procura post
        const post = await this.postModel.findOne({ _id: POST_ID });
        if (!post) throw new NotFoundException('Comentário não encontrado');

        // Procura comunidade associada ao post
        const comunidade = await this.comunidadeModel.findById(post.comunidade);
        if (!comunidade) throw new NotFoundException('Comunidade não encontrada');

        // Verifica se autor é membro da comunidade
        const isMember = comunidade.membros.some((membroId) => membroId.toString() === userId);
        if (!isMember) throw new ForbiddenException('Usuário não é membro da comunidade');

        // Verifica formato do comentário
        if (!updateCommentDto.conteudo) {
            throw new BadRequestException('Nada para atualizar');
        }
        if (updateCommentDto.conteudo !== undefined && updateCommentDto.conteudo === '') {
            throw new BadRequestException('Comentário deve conter texto e no máximo 4 imagens');
        }

        // Filtra apenas os campos permitidos para atualizar
        const allowedUpdate: Partial<UpdateCommentDto> = {};
        if (updateCommentDto.conteudo !== undefined) allowedUpdate.conteudo = updateCommentDto.conteudo;

        // Update atômico do comentário
        const updatedComment = await this.comentarioModel.findOneAndUpdate(
            { _id: COMMENT_ID, post: POST_ID, autor: USER_ID },
            { $set: allowedUpdate },
            { new: true }
        ).populate('autor', 'username');

        return {
            message: 'Comentário atualizado com sucesso',
            comment: updatedComment
        };
    }
}