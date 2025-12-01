import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostCategoria, PostStatus } from '../schemas/post.schema';
import { Comunidade } from '../comunidades/entities/comunidade.entity';
import { Comentario } from '../schemas/comentario.schema';
import { User } from '../users/entities/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { ModerarPostDto } from './dto/moderar-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueueProducerService } from '../queue/queue.producer.service';
import { FILAS, ROUTING_KEYS } from '../queue/queue.constants';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Comunidade.name) private comunidadeModel: Model<Comunidade>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Comentario.name) private comentarioModel: Model<Comentario>,
    private readonly queueProducer: QueueProducerService,
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

    // Associar post à comunidade e ao usuário
    await Promise.all([
      this.comunidadeModel.findByIdAndUpdate(
        comunidade._id,
        { $push: { posts: savedPost._id } }
      ),
      this.userModel.findByIdAndUpdate(
        userId,
        { $push: { posts: savedPost._id } }
      ),
    ]);

    // Publicar eventos assíncronos 
    try {
      // Notificar membros sobre novo post 
      if (status === PostStatus.PUBLICADO) {
        await this.queueProducer.publish(
          ROUTING_KEYS.NOTIFICAR_POST_CRIADO,
          {
            postId: (savedPost._id as Types.ObjectId).toString(),
            autorId: userId,
            comunidadeId: (comunidade._id as Types.ObjectId).toString(),
            comunidadeNome: comunidade.nome,
            conteudo: createPostDto.conteudo,
          }
        );

        // Atualizar métricas da comunidade
        await this.queueProducer.publish(
          ROUTING_KEYS.METRICAS_POST_CRIADO,
          {
            postId: (savedPost._id as Types.ObjectId).toString(),
            comunidadeId: (comunidade._id as Types.ObjectId).toString(),
            categoria,
          }
        );
      }

      // Processar imagens se houver
      if (createPostDto.imagens && createPostDto.imagens.length > 0) {
        await this.queueProducer.publicarNaFila(FILAS.PROCESSAR_IMAGENS, {
          postId: (savedPost._id as Types.ObjectId).toString(),
          imagens: createPostDto.imagens,
          tipo: 'post',
        });
      }
    } catch (error) {
      console.error('Erro ao publicar eventos do post:', error);
    }

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

      // Notificar autor do post 
      const fullPost = await this.postModel.findById(postId).populate('comunidade', 'nome');
      if (fullPost && !fullPost.autor.equals(id)) {
        try {
          const comunidadeNome = (fullPost.comunidade as any)?.nome;
          await this.queueProducer.publish(
            ROUTING_KEYS.NOTIFICAR_POST_CURTIDO,
            {
              postId: postId,
              autorId: fullPost.autor.toString(),
              userId: userId,
              comunidadeNome: comunidadeNome,
            }
          );
        } catch (error) {
          console.error('Erro ao publicar notificação de curtida:', error);
        }
      }
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

  async updatePost(userId: string, postId: string, updatePostDto: UpdatePostDto) {
    const post = await this.postModel.findById(postId).populate('autor comunidade');
    if (!post) throw new NotFoundException('Post não encontrado');

    const id = new Types.ObjectId(userId);

    // Verificar se o usuário é o autor do post
    const isOwner = post.autor._id.equals(id);
    if (!isOwner) throw new ForbiddenException('Apenas o autor do post pode editá-lo');

    // Só permite edição se: 1) comunidade existir, 2) usuário for membro da comunidade e 3) post não estiver pendente de moderação
    const comunidade = await this.comunidadeModel.findById(post.comunidade._id);
    if (!comunidade) throw new NotFoundException('Comunidade não encontrada');

    const isMembro = comunidade.membros.some((membroId) => membroId.equals(id));
    if (!isMembro) throw new ForbiddenException('Você precisa ser membro da comunidade para editar o post');

    if (post.status === PostStatus.PENDENTE_MODERACAO) throw new ForbiddenException('Posts pendentes de moderação não podem ser editados');
    
    // Atualizar post
    const allowedFields: (keyof UpdatePostDto)[] = ['conteudo', 'imagens', 'solicitacao_revisao', 'publico', 'tags', 'livro_referenciado'];

    const filteredUpdates = Object.fromEntries(
      Object.entries(updatePostDto).filter(([key]) =>
        allowedFields.includes(key as keyof UpdatePostDto)
      )
    );

    if (Object.keys(filteredUpdates).length === 0) throw new BadRequestException('Nenhum campo válido para atualização foi fornecido.');

    const updatedPost = await this.postModel.findOneAndUpdate(
      { _id: postId, autor: id },
      { $set: filteredUpdates },
      { new: true }
    ).populate('autor comunidade');

    return {
      message: 'Post atualizado com sucesso',
      post: updatedPost 
    };
  }

  async moderatePost(moderatorId: string, postId: string, moderarPostDto: ModerarPostDto) {
    const post = await this.postModel.findById(postId).populate('autor comunidade');
    if (!post) throw new NotFoundException('Post não encontrado');

    const id = new Types.ObjectId(moderatorId);

    // Verifica se comunidade existe
    const comunidade = await this.comunidadeModel.findById(post.comunidade._id, 'moderadores');
    if (!comunidade) throw new NotFoundException('Comunidade não encontrada');

    // Verifica se usuário é moderador da comunidade
    const isModerator = comunidade.moderadores.some((modId) => modId.equals(id));
    if (!isModerator) throw new ForbiddenException('Usuário não tem permissão para moderar este post');

    // Atualizar informações do post conforme decisão da moderação
    post.solicitacao_revisao = false;

    if (moderarPostDto.aprovar) {
      if (!moderarPostDto.categoria) throw new BadRequestException('Categoria deve ser fornecida ao aprovar o post');
      
      post.status = PostStatus.PUBLICADO;
      post.categoria = moderarPostDto.categoria;

      await post.save();

    } else {
      // Rejeitar post => Apagar post
      post.status = PostStatus.REJEITADO;

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
    }

    // Notificar autor sobre resultado da moderação
    try {
      await this.queueProducer.publish(
        ROUTING_KEYS.NOTIFICAR_POST_MODERADO,
        {
          postId: postId,
          autorId: post.autor._id.toString(),
          aprovado: moderarPostDto.aprovar,
          categoria: moderarPostDto.aprovar ? moderarPostDto.categoria : null,
          comunidadeNome: (post.comunidade as any).nome,
        }
      );
    } catch (error) {
      console.error('Erro ao publicar notificação de moderação:', error);
    }

    return { 
      message: 'Post moderado com sucesso', 
      status: moderarPostDto.aprovar ? 'Aprovado' : 'Rejeitado'
    };
  }

  async getPostById(postId: string, communityName: string) {
    const community = await this.comunidadeModel.findOne({ nome: communityName });
    if (!community) throw new NotFoundException('Comunidade não encontrada');

    const post = await this.postModel.findOne({
      _id: postId,
      comunidade: community._id,
    }).populate('autor', 'username avatarUrl').populate("comunidade", "nome");;

    if (!post) throw new NotFoundException('Post não encontrado na comunidade');

    return post;
  }

  async getComments(postId: string) {
    const post = await this.postModel.findOne({ _id: postId });
    if (!post) throw new NotFoundException('Post não encontrado');

    const comments = await this.comentarioModel.find({
      post: new Types.ObjectId(postId),
    })
    .sort({ createdAt: -1 })
    .populate('autor', 'username avatarUrl')
    .lean();

    return comments;
  }
}
