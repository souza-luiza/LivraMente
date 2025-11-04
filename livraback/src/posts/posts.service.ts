import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostCategoria, PostStatus } from '../schemas/post.schema';
import { Comunidade } from '../comunidades/entities/comunidade.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Comunidade.name) private comunidadeModel: Model<Comunidade>,
  ) {}

  async create(userId: string, createPostDto: CreatePostDto) {
    // Validar que a comunidade existe
    const comunidade = await this.comunidadeModel.findById(createPostDto.comunidade);
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
      comunidade: new Types.ObjectId(createPostDto.comunidade),
      categoria,
      status,
      imagens: createPostDto.imagens || [],
      tags: createPostDto.tags || [],
      publico: createPostDto.publico !== undefined ? createPostDto.publico : true,
    });

    const savedPost = await post.save();

    // Adicionar post à comunidade
    await this.comunidadeModel.findByIdAndUpdate(
      createPostDto.comunidade,
      { $push: { posts: savedPost._id } }
    );

    return savedPost.populate('autor', 'username nome_exibicao imagem_perfil');
  }

  async findAllByComunidade(comunidadeId: string, userId?: string) {
    const comunidade = await this.comunidadeModel.findById(comunidadeId);
    if (!comunidade) {
      throw new NotFoundException('Comunidade não encontrada');
    }

    // Buscar apenas posts publicados
    const posts = await this.postModel
      .find({
        comunidade: new Types.ObjectId(comunidadeId),
        status: PostStatus.PUBLICADO,
      })
      .populate('autor', 'username nome_exibicao imagem_perfil')
      .populate('livro_referenciado', 'nome capa_url')
      .sort({ createdAt: -1 });

    return posts;
  }

  async findAllByCategoria(comunidadeId: string, categoria: PostCategoria) {
    const posts = await this.postModel
      .find({
        comunidade: new Types.ObjectId(comunidadeId),
        categoria,
        status: PostStatus.PUBLICADO,
      })
      .populate('autor', 'username nome_exibicao imagem_perfil')
      .populate('livro_referenciado', 'nome capa_url')
      .sort({ createdAt: -1 });

    return posts;
  }

  async findPendentes(comunidadeId: string, userId: string) {
    const comunidade = await this.comunidadeModel.findById(comunidadeId);
    if (!comunidade) {
      throw new NotFoundException('Comunidade não encontrada');
    }

    // Verificar se o usuário é moderador
    const isModerador = comunidade.moderadores.some(
      (modId) => modId.toString() === userId
    );

    if (!isModerador) {
      throw new ForbiddenException('Apenas moderadores podem ver posts pendentes');
    }

    const posts = await this.postModel
      .find({
        comunidade: new Types.ObjectId(comunidadeId),
        status: PostStatus.PENDENTE_MODERACAO,
      })
      .populate('autor', 'username nome_exibicao imagem_perfil')
      .sort({ createdAt: -1 });

    return posts;
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de post inválido');
    }

    const post = await this.postModel
      .findById(id)
      .populate('autor', 'username nome_exibicao imagem_perfil')
      .populate('livro_referenciado', 'nome capa_url')
      .populate('comentarios');               // inclui comentarios

    if (!post) {
      throw new NotFoundException('Post não encontrado');
    }

    return post;
  }

  async update(userId: string, id: string, updatePostDto: UpdatePostDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de post inválido');
    }

    const post = await this.postModel.findById(id);
    if (!post) {
      throw new NotFoundException('Post não encontrado');
    }

    // Verificar se o usuário é o autor
    if (post.autor.toString() !== userId) {
      throw new ForbiddenException('Você só pode editar seus próprios posts');
    }

    // Validar número de imagens se estiver sendo atualizado
    if (updatePostDto.imagens && updatePostDto.imagens.length > 4) {
      throw new BadRequestException('Máximo de 4 imagens por post');
    }

    const updatedPost = await this.postModel
      .findByIdAndUpdate(id, updatePostDto, { new: true })
      .populate('autor', 'username nome_exibicao imagem_perfil');

    return updatedPost;
  }

  async remove(userId: string, id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de post inválido');
    }

    const post = await this.postModel.findById(id);
    if (!post) {
      throw new NotFoundException('Post não encontrado');
    }

    // Verificar se o usuário é o autor
    if (post.autor.toString() !== userId) {
      const comunidade = await this.comunidadeModel.findById(post.comunidade);
      if (!comunidade) {
        throw new NotFoundException('Comunidade não encontrada');
      }
      
      // Verificar se é moderador da comunidade
      const isModerador = comunidade.moderadores.some(
        (modId) => modId.toString() === userId
      );

      if (!isModerador) {
        throw new ForbiddenException('Você não tem permissão para deletar este post');
      }
    }

    await this.postModel.findByIdAndDelete(id);

    // Remover post da comunidade
    await this.comunidadeModel.findByIdAndUpdate(
      post.comunidade,
      { $pull: { posts: post._id } }
    );

    return { message: 'Post removido com sucesso' };
  }

  async moderarPost(
    userId: string,
    postId: string,
    categoria: PostCategoria,
    aprovar: boolean
  ) {
    if (!Types.ObjectId.isValid(postId)) {
      throw new BadRequestException('ID de post inválido');
    }

    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new NotFoundException('Post não encontrado');
    }

    // Verificar se o post está pendente de moderação
    if (post.status !== PostStatus.PENDENTE_MODERACAO) {
      throw new BadRequestException('Este post não está pendente de moderação');
    }

    const comunidade = await this.comunidadeModel.findById(post.comunidade);
    if (!comunidade) {
      throw new NotFoundException('Comunidade não encontrada');
    }
    
    // Verificar se o usuário é moderador
    const isModerador = comunidade.moderadores.some(
      (modId) => modId.toString() === userId
    );

    if (!isModerador) {
      throw new ForbiddenException('Apenas moderadores podem moderar posts');
    }

    // Atualizar status e categoria
    post.status = aprovar ? PostStatus.PUBLICADO : PostStatus.REJEITADO;
    if (aprovar) {
      post.categoria = categoria;
    }

    await post.save();

    return post.populate('autor', 'username nome_exibicao imagem_perfil');
  }

  async curtirPost(userId: string, postId: string) {
    if (!Types.ObjectId.isValid(postId)) {
      throw new BadRequestException('ID de post inválido');
    }

    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new NotFoundException('Post não encontrado');
    }

    const userObjectId = new Types.ObjectId(userId);
    const jaCurtiu = post.curtidas.some(
      (curtidaId) => curtidaId.toString() === userId
    );

    if (jaCurtiu) {
      // Descurtir
      post.curtidas = post.curtidas.filter(
        (curtidaId) => curtidaId.toString() !== userId
      );
    } else {
      // Curtir
      post.curtidas.push(userObjectId);
    }

    await post.save();
    return { curtidas: post.curtidas.length, jaCurtiu: !jaCurtiu };
  }
}
