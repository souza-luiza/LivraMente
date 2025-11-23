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