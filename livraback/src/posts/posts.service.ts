import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostCategoria, PostStatus } from '../schemas/post.schema';
import { Comunidade } from '../comunidades/entities/comunidade.entity';
import { User } from '../users/entities/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Comunidade.name) private comunidadeModel: Model<Comunidade>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async createPost(userId: string, createPostDto: CreatePostDto) {
    let comunidade;
    
    // Tentar buscar por ID primeiro
    if (Types.ObjectId.isValid(createPostDto.comunidade)) {
      comunidade = await this.comunidadeModel.findById(createPostDto.comunidade);
    }
    
    // Se não encontrou, tentar buscar por nome
    if (!comunidade) {
      comunidade = await this.comunidadeModel.findOne({ nome: createPostDto.comunidade });
    }
    
    if (!comunidade) {
      throw new NotFoundException('Comunidade não encontrada');
    }

    // Verificar se o usuário é membro da comunidade
    const isMembro = comunidade.membros.some(
      (membroId) => membroId.toString() === userId
    );

    if (!isMembro) {
      throw new ForbiddenException('Você precisa ser membro da comunidade para postar');
    }

    // Validar número de imagens (máximo 4)
    if (createPostDto.imagens && createPostDto.imagens.length > 4) {
      throw new BadRequestException('Máximo de 4 imagens por post');
    }

    // Determinar status do post
    let status = PostStatus.PUBLICADO;
    let categoria = createPostDto.categoria || PostCategoria.GERAL;

    if (createPostDto.solicitacao_revisao) {
      status = PostStatus.PENDENTE_MODERACAO;
      // Se solicitou revisão, manter categoria como GERAL até moderação
      categoria = PostCategoria.GERAL;
    }

    const post = new this.postModel({
      ...createPostDto,
      autor: new Types.ObjectId(userId),
      comunidade: comunidade._id, 
      categoria,
      status,
      imagens: createPostDto.imagens || [],
      tags: createPostDto.tags || [],
      publico: createPostDto.publico !== undefined ? createPostDto.publico : true,
    });

    const savedPost = await post.save();

    // Adicionar post à comunidade
    await this.comunidadeModel.findByIdAndUpdate(
      comunidade._id,
      { $push: { posts: savedPost._id } }
    );

    return savedPost.populate('autor', 'username nome_exibicao imagem_perfil');
  }

  async likePost(userId: string, postId: string) {
    const post = await this.postModel.findById(postId, 'curtidas');
    if (!post) throw new NotFoundException('Post não encontrado');

    const id = new Types.ObjectId(userId);

    const hasLiked = post.curtidas.some((curtidaId) => curtidaId.equals(id));

    if (hasLiked) {
      // Descurtir
      await this.postModel.updateOne({ _id: postId }, { $pull: { curtidas: id } });

    } else {
      // Curtir
      await this.postModel.updateOne({ _id: postId }, { $addToSet: { curtidas: id } });

    }

    const updatedPost = await this.postModel.findById(postId, 'curtidas');
    if (!updatedPost) throw new NotFoundException('Post não encontrado');
    
    return {
      liked: !hasLiked,
      likeAmount: updatedPost.curtidas.length,
    };
  }

  async removePost(userId: string, postId: string) {
    const post = await this.postModel.findById(postId).populate('autor comunidade');
    if (!post) throw new NotFoundException('Post não encontrado');

    const id = new Types.ObjectId(userId);

    // Verificar se o usuário é o autor do post
    const isOwner = post.autor._id.equals(id);

    // Verifica se usuário é moderador da comunidade
    let isModerator = false;
    if (!isOwner) {
      const comunidade = await this.comunidadeModel.findById(post.comunidade._id, 'moderadores');
      if (!comunidade) throw new NotFoundException('Comunidade não encontrada');

      isModerator = comunidade.moderadores.some((modId) => modId.equals(id));
    }

    if (!isOwner && !isModerator) throw new ForbiddenException('Usuário não tem permissão para deletar este post');

    await this.postModel.findByIdAndDelete(postId);

    await Promise.all([
      this.postModel.findByIdAndDelete(postId),
      this.comunidadeModel.updateOne(
        { _id: post.comunidade._id },
        { $pull: { posts: post._id } }
      ),
      this.userModel.updateOne(
        { _id: post.autor._id },
        { $pull: { posts: post._id } }
      ),
    ]);

    return { message: 'Post removido com sucesso' };
  }

  async editPost(userId: string, postId: string, updatePostDto: UpdatePostDto) {

  }
  
}
