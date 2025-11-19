import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comunidade } from '../comunidades/entities/comunidade.entity';
import { Comentario } from '../schemas/comentario.schema';
import { Post } from '../schemas/post.schema';
import { extractMentions } from '../common/utils/text.utils';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CommentsService {
    constructor(
        @InjectModel(Post.name) private postModel: Model<Post>,
        @InjectModel(Comunidade.name) private comunidadeModel: Model<Comunidade>,
        @InjectModel(Comentario.name) private comentarioModel: Model<Comentario>,
        @InjectModel(User.name) private userModel: Model<User>,
    ) {}

    async createComment(userId: string, postId: string, createCommentDto: CreateCommentDto) {
        const post = await this.postModel.findById(postId);
        if (!post) throw new NotFoundException('Post não encontrado')

        const comunidade = await this.comunidadeModel.findById(post.comunidade);
        if (!comunidade) throw new NotFoundException('Comunidade não encontrada');

        const isMember = comunidade.membros.some((membroId) => membroId.toString() === userId);
        if (!isMember) throw new ForbiddenException('Usuário não é membro da comunidade');

        if ((createCommentDto.imagens && createCommentDto.imagens.length > 4) || !createCommentDto.conteudo) {
            throw new BadRequestException('Comentário deve conter texto e no máximo 4 imagens')
        }

        // Retirando menções do texto
        const mentionedUsernames = extractMentions(createCommentDto.conteudo);
        const mentionedUsers = await this.userModel.find({username: { $in: mentionedUsernames }}).select("_id");
        const mentionedUserIds = mentionedUsers.map(u => u._id);
        
        // Criando comentário
        const comment = new this.comentarioModel({
            ...createCommentDto,
            autor: new Types.ObjectId(userId),
            post: new Types.ObjectId(postId),
            curtidas: [],
            mencoes: mentionedUserIds
        })

        await comment.save();

        // Salvando referência no post
        await this.postModel.findByIdAndUpdate(
            postId,
            { $push: { comentarios: comment._id } }
        )

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

        await this.comentarioModel.findByIdAndDelete(commentId);

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
        if (!updateCommentDto.conteudo && !updateCommentDto.imagens) {
            throw new BadRequestException('Nada para atualizar');
        }
        if ((updateCommentDto.conteudo !== undefined && updateCommentDto.conteudo === '') || (updateCommentDto.imagens && updateCommentDto.imagens.length > 4)) {
            throw new BadRequestException('Comentário deve conter texto e no máximo 4 imagens');
        }

        // Filtra apenas os campos permitidos para atualizar
        const allowedUpdate: Partial<UpdateCommentDto> = {};
        if (updateCommentDto.conteudo !== undefined) allowedUpdate.conteudo = updateCommentDto.conteudo;
        if (updateCommentDto.imagens !== undefined) allowedUpdate.imagens = updateCommentDto.imagens;

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