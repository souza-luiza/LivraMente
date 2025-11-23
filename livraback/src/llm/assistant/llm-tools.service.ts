import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Story, StoryDocument } from '../../schemas/story.schema';
import { ComunidadesService } from 'src/comunidades/comunidades.service';
import { ReadlistsService } from 'src/readlists/readlists.service';
import { UsersService } from 'src/users/users.service';
import { DynamicStructuredTool } from '@langchain/core/tools';

@Injectable()
export class LlmToolsService {
  constructor(
    private readonly comunidadesService: ComunidadesService,
    private readonly readlistsService: ReadlistsService,
    private readonly usersService: UsersService,

    @InjectModel(Story.name) private storyModel: Model<StoryDocument>,

  ) { }

  // --- Ferramentas de História ---

  public createGetUserStoriesTool(userId: string): DynamicStructuredTool {
    return new DynamicStructuredTool({
      name: 'get_user_stories',
      description: 'Busca todas as histórias (título e resumo) criadas pelo usuário logado.',
      schema: z.object({}),
      func: async () => {
        try {
          const stories = await this.storyModel
            .find({ userId })
            .select('title summary')
            .limit(50).exec();
          return JSON.stringify(stories);
        } catch (e) { return `Erro ao buscar histórias: ${e.message}`; }
      },
    });
  }

  public createGetRecentStoriesTool(): DynamicStructuredTool {
    const toolSchema = z.object({
      count: z.number().default(3).describe("O número de histórias a buscar"),
    });

    return new DynamicStructuredTool({
      name: 'get_recent_stories',
      description: 'Busca as "count" histórias mais recentes criadas no site.',
      schema: toolSchema,
      func: async ({ count }) => {
        try {
          const stories = await this.storyModel.find()
            .sort({ createdAt: -1 })
            .limit(count)
            .exec();
          return JSON.stringify(stories);
        } catch (e) { return `Erro ao buscar histórias recentes: ${e.message}`; }
      },
    });
  }

  // --- Ferramentas de Comunidade ---

  public createGetPopularCommunitiesTool(): DynamicStructuredTool {
    const toolSchema = z.object({
      count: z.number().default(5).describe("O número de comunidades a buscar"),
    });

    return new DynamicStructuredTool({
      name: 'get_popular_communities',
      description: 'Busca as comunidades mais populares do site.',
      schema: toolSchema,
      func: async ({ count }) => {
        try {
          const todas = await this.comunidadesService.findAll();
          const populares = todas
            .sort((a, b) => b.membros.length - a.membros.length)
            .slice(0, count);
          return JSON.stringify(populares);
        } catch (e) { return `Erro ao buscar comunidades: ${e.message}`; }
      },
    });
  }

  public createJoinCommunityTool(userId: string): DynamicStructuredTool {
    const toolSchema = z.object({
      communityName: z.string().describe('O nome ou slug da comunidade para entrar'),
    });

    return new DynamicStructuredTool({
      name: 'join_community',
      description: 'Adiciona o usuário autenticado à comunidade indicada.',
      schema: toolSchema,
      func: async ({ communityName }) => {
        try {
          const result = await this.comunidadesService.addMembro(userId, communityName);
          return JSON.stringify(result);
        } catch (e) { return `Erro ao entrar na comunidade: ${e.message}`; }
      },
    });
  }

  public createGetCommunitiesTool(): DynamicStructuredTool {
    const toolSchema = z.object({
      communityName: z.string().describe("O nome da comunidade para buscar"),
    });

    return new DynamicStructuredTool({
      name: 'get_community',
      description: 'Encontra os detalhes de uma comunidade específica.',
      schema: toolSchema,
      func: async ({ communityName }) => {
        try {
          const community = await this.comunidadesService.findOne(communityName);
          return JSON.stringify(community);
        } catch (e) { return `Erro ao encontrar a comunidade: ${e.message}`; }
      },
    });
  }

  public createLeaveCommunityTool(userId: string): DynamicStructuredTool {
    const toolSchema = z.object({
      communityName: z.string().describe('O nome ou slug da comunidade para sair'),
    });

    return new DynamicStructuredTool({
      name: 'leave_community',
      description: 'Remove o usuário autenticado da comunidade indicada.',
      schema: toolSchema,
      func: async ({ communityName }) => {
        try {
          const result = await this.comunidadesService.removeMembro(userId, communityName);
          return JSON.stringify(result);
        } catch (e) { return `Erro ao sair da comunidade: ${e.message}`; }
      },
    });
  }

  public createGetPopularPostsInCommunityTool(): DynamicStructuredTool {
    const toolSchema = z.object({
      communityName: z.string().describe('O nome ou slug da comunidade'),
    });

    return new DynamicStructuredTool({
      name: 'get_popular_posts_in_community',
      description: 'Busca os posts mais populares de uma comunidade específica.',
      schema: toolSchema,
      func: async ({ communityName }) => {
        try {
          const posts = await this.comunidadesService.findAllPosts(communityName);
          return JSON.stringify(posts);
        } catch (e) { return `Erro ao buscar posts: ${e.message}`; }
      },
    });
  }

  // --- Ferramentas de Readlist ---

  public createFindReadlistByNameTool(userId: string): DynamicStructuredTool {
    const toolSchema = z.object({
      readlistName: z.string().describe("O nome da readlist a ser buscada"),
    });
    return new DynamicStructuredTool({
      name: 'find_readlist_by_name',
      description: 'Busca uma readlist específica do usuário pelo nome.',
      schema: toolSchema,
      func: async ({ readlistName }) => {
        try {
          const readlists = await this.readlistsService.findAll(userId);
          const found = readlists.find(r => r.nome.toLowerCase() === readlistName.toLowerCase());

          if (!found) return `Readlist com nome '${readlistName}' não encontrada.`;
          return JSON.stringify({ id: (found as any)._id, nome: found.nome });
        } catch (e) { return `Erro ao buscar readlist: ${e.message}`; }
      },
    });
  }

  public createAddBookToReadlistTool(userId: string): DynamicStructuredTool {
    const toolSchema = z.object({
      readlistId: z.string().describe("O ID da readlist (obtido com 'find_readlist_by_name')"),
      livroId: z.string().describe("O ID do livro (obtido com 'find_livro_by_name')"),
    });

    return new DynamicStructuredTool({
      name: 'add_book_to_readlist',
      description: 'Adiciona um livro (por ID) a uma readlist (por ID).',
      schema: toolSchema,
      func: async ({ readlistId, livroId }) => {
        try {
          const result = await this.readlistsService.addLivro(userId, readlistId, livroId);
          return `Livro (ID: ${livroId}) adicionado com sucesso à readlist '${result.nome}'.`;
        } catch (e) { return `Erro ao adicionar livro: ${e.message}`; }
      },
    });
  }

  public createRemoveBookFromReadlistTool(userId: string): DynamicStructuredTool {
    const toolSchema = z.object({
      readlistId: z.string().describe("O ID da readlist"),
      livroId: z.string().describe("O ID do livro a ser removido"),
    });

    return new DynamicStructuredTool({
      name: 'remove_book_from_readlist',
      description: 'Remove um livro (por ID) de uma readlist (por ID).',
      schema: toolSchema,
      func: async ({ readlistId, livroId }) => {
        try {
          const result = await this.readlistsService.removeLivro(userId, readlistId, livroId);
          return `Livro (ID: ${livroId}) removido com sucesso da readlist '${result.nome}'.`;
        } catch (e) { return `Erro ao remover livro: ${e.message}`; }
      },
    });
  }

  public createCreateReadlistTool(userId: string): DynamicStructuredTool {
    const toolSchema = z.object({
      nome: z.string().describe("O nome da nova readlist"),
      descricao: z.string().optional().describe("Descrição da readlist"),
      publica: z.boolean().default(false).describe("Se é pública"),
    });

    return new DynamicStructuredTool({
      name: 'create_readlist',
      description: 'Cria uma nova readlist para o usuário.',
      schema: toolSchema,
      func: async ({ nome, descricao, publica }) => {
        try {
          const createDto = { nome, descricao, publica };
          const result = await this.readlistsService.create(userId, createDto);
          return `Readlist '${result.nome}' criada com ID: ${result._id}.`;
        } catch (e) { return `Erro ao criar readlist: ${e.message}`; }
      },
    });
  }

  public createDeleteReadlistTool(userId: string): DynamicStructuredTool {
    const toolSchema = z.object({
      readlistId: z.string().describe("O ID da readlist"),
    });

    return new DynamicStructuredTool({
      name: 'delete_readlist',
      description: 'Deleta uma readlist do usuário.',
      schema: toolSchema,
      func: async ({ readlistId }) => {
        try {
          await this.readlistsService.remove(userId, readlistId);
          return `Readlist (ID: ${readlistId}) deletada com sucesso.`;
        } catch (e) { return `Erro ao deletar readlist: ${e.message}`; }
      },
    });
  }

  // --- Ferramentas de Usuário (Usando UsersService) ---

  public createUsersGetMyReadlistsTool(userId: string): DynamicStructuredTool {
    return new DynamicStructuredTool({
      name: 'users_get_my_readlists',
      description: 'Obtém as readlists criadas pelo usuário.',
      schema: z.object({}),
      func: async () => {
        try {
          const readlists = await this.readlistsService.findAll(userId);
          return JSON.stringify(readlists);
        } catch (e) { return `Erro ao obter readlists: ${e.message}`; }
      },
    });
  }

  public createGravarLeituraTool(userId: string): DynamicStructuredTool {
    const toolSchema = z.object({
      livroId: z.string().describe("O ID do livro"),
      qtd: z.number().describe("Quantidade lida"),
      opcao: z.number().describe("0 para livros, 1 para minutos"),
    });

    return new DynamicStructuredTool({
      name: 'gravar_leitura',
      description: 'Registra o progresso de leitura.',
      schema: toolSchema,
      func: async ({ livroId, opcao, qtd }) => {
        try {
          await this.usersService.registroLeitura(livroId, opcao, qtd);
          return "Leitura registrada com sucesso.";
        } catch (e) { return `Erro ao gravar leitura: ${e.message}`; }
      },
    });
  }

  public createUsersGetMyProfileTool(userId: string): DynamicStructuredTool {
    return new DynamicStructuredTool({
      name: 'users_get_my_profile',
      description: 'Obtém o perfil do usuário autenticado.',
      schema: z.object({}),
      func: async () => {
        try {
          const profile = await this.usersService.findOne(userId);
          return JSON.stringify(profile);
        } catch (e) { return `Erro ao obter perfil: ${e.message}`; }
      },
    });
  }

  public createUsersGetMyFavoritesReadlistsTool(userId: string): DynamicStructuredTool {
    return new DynamicStructuredTool({
      name: 'users_get_my_favorites_readlists',
      description: 'Obtém as readlists favoritas do usuário.',
      schema: z.object({}),
      func: async () => {
        try {
          const favorites = await this.usersService.findReadlistsFavoritas(userId);
          return JSON.stringify(favorites);
        } catch (e) { return `Erro ao obter favoritos: ${e.message}`; }
      },
    });
  }
}