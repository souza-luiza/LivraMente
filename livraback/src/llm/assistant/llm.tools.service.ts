import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Story, StoryDocument } from '../../schemas/story.schema';
import { Comunidade, ComunidadeDocument } from 'src/comunidades/entities/comunidade.entity';
import { ComunidadesService } from 'src/comunidades/comunidades.service';
import { Readlist, ReadlistDocument } from 'src/readlists/entities/readlist.entity';
import { ReadlistsService } from 'src/readlists/readlists.service';
import { DynamicStructuredTool } from 'langchain';

@Injectable()
export class LlmToolsService {
  constructor(
    @InjectModel(Story.name) private storyModel: Model<StoryDocument>,
    @InjectModel(Comunidade.name) private communityModel: Model<ComunidadeDocument>,
    @InjectModel(Readlist.name) private readlistModel: Model<ReadlistDocument>,
    private comunidadesService: ComunidadesService,
    private readlistsService: ReadlistsService,
  ) { }

  //ferramenta para buscar as histórias do usuário logado
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
        } catch (e) {
          return `Erro ao buscar histórias: ${e instanceof Error ? e.message : String(e)}`;
        }
      },
    });
  }

  //ferramenta para buscar as n comunidades mais populares
  public createGetPopularCommunitiesTool(): DynamicStructuredTool {

    const toolSchema = z.object({
      count: z.number().default(5).describe("O número de comunidades a buscar"),
    });

    return new DynamicStructuredTool({
      name: 'get_popular_communities',
      description: 'Busca as "count" comunidades mais populares do site Livramente. Se o usuário não especificar um número, o padrão é 5.',
      schema: toolSchema,
      func: async ({ count }: { count: number }) => {
        try {
          const comunidades = await this.communityModel
            .find()
            .sort({ members: -1 })
            .limit(count) //é dinâmico
            .exec();
          return JSON.stringify(comunidades);
        } catch (e) {
          return `Erro ao buscar comunidades: ${e instanceof Error ? e.message : String(e)}`;
        }
      },
    });
  }

  //ferramenta para buscar as n histórias mais recentes
  public createGetRecentStoriesTool(): DynamicStructuredTool {

    const toolSchema = z.object({
      count: z.number().default(3).describe("O número de histórias a buscar"),
    });

    return new DynamicStructuredTool({
      name: 'get_recent_stories',
      description: 'Busca as "count" histórias mais recentes criadas no site Livramente. Se o usuário não especificar um número, o padrão é 3.',
      schema: toolSchema,
      func: async ({ count }: { count: number }) => {
        try {
          const stories = await this.storyModel.find()
            .sort({ createdAt: -1 })
            .limit(count)
            .exec();
          return JSON.stringify(stories);
        } catch (e) {
          return `Erro ao buscar histórias recentes: ${e instanceof Error ? e.message : String(e)}`;
        }
      },
    });
  }

  //ferramenta para adicionar usuario na comunidade
  //obs.: rever essa ferramenta que podera ser usado por moderador da comunidade
  /*
  public createJoinCommunityTool(): DynamicStructuredTool {

    const toolSchema = z.object({
      communityId: z.string().describe("O ID da comunidade que o usuário deseja entrar"),
      userId: z.string().describe("O ID do usuário que deseja entrar na comunidade"),
    });

    return new DynamicStructuredTool({
      name: 'join_community',
      description: 'Adiciona o usuário especificado à comunidade indicada; retorna a comunidade atualizada ou uma mensagem de erro.',
      schema: toolSchema,
      func: async ({ communityId, userId }: { communityId: string; userId: string }) => {
        try {
          const community = await this.communityModel.findById(communityId).exec();
          if (!community) {
            return `Comunidade não encontrada: ${communityId}`;
          }
          // adiciona o usuário ao array membros sem duplicatas e retorna a comunidade atualizada
          const updated = await this.communityModel.findByIdAndUpdate(
            communityId,
            { $addToSet: { membros: userId } },
            { new: true }
          ).exec();
          return JSON.stringify(updated);
        } catch (e) {
          return `Erro ao juntar usuário na comunidade: ${e instanceof Error ? e.message : String(e)}`;
        }
      },
    });
  }
    */

  // Ferramenta para ENTRAR na comunidade
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
        } catch (e) {
          return `Erro ao entrar na comunidade: ${e.message}`;
        }
      },
    });
  }

  //ferramenta para achar comunidade
  public createGetCommunitiesTool(): DynamicStructuredTool {

    const toolSchema = z.object({
      communityId: z.string().describe("O ID da comunidade que o usuário deseja encontrar"),
    });

    return new DynamicStructuredTool({
      name: 'get_community',
      description: 'Encontra a comunidade que o usuário esta procurando; retorna a comunidade ou uma mensagem de erro.',
      schema: toolSchema,
      func: async ({ communityId }: { communityId: string }) => {
        try {
          const community = await this.communityModel.findById(communityId).exec();
          if (!community) {
            return `Comunidade não encontrada: ${communityId}`;
          }
        } catch (e) {
          return `Erro ao encontrar a comunidade: ${e instanceof Error ? e.message : String(e)}`;
        }
      },
    });
  }

  //ferramenta para sair da comunidade
  public createLeaveCommunityTool(userId: string): DynamicStructuredTool {
    const toolSchema = z.object({
      communityName: z.string().describe('O nome ou slug da comunidade para sair'),
    });

    return new DynamicStructuredTool({
      name: 'leave_community',
      description: 'Remove o usuário autenticado da comunidade indicada; retorna a comunidade atualizada ou uma mensagem de erro.',
      schema: toolSchema,
      func: async ({ communityName }) => {
        try {
          const result = await this.comunidadesService.removeMembro(userId, communityName);
          return JSON.stringify(result);
        } catch (e) {
          return `Erro ao sair da comunidade: ${e.message}`;
        }
      },
    });
  }

  //ferramenta para buscar os posts mais populares da comunidade
  // rever sobre essa ferramenta e ver se da para usar em uma parte específica do feed
  public createGetPopularPostsInCommunityTool(): DynamicStructuredTool {

    const toolSchema = z.object({
      communityName: z.string().describe('O nome ou slug da comunidade para buscar os posts; se não fornecido, busca no site inteiro'),
    });

    return new DynamicStructuredTool({
      name: 'get_popular_posts_in_community',
      description: 'Busca os posts mais populares. Se communityName não for informado, pedir para informar a comunidade específica.',
      schema: toolSchema,
      func: async ({ communityName }) => {
        try {
          const posts = await this.comunidadesService.findAllPosts(communityName);

          if (!posts || posts.length === 0) {
            return `Nenhum post encontrado na comunidade: ${communityName}`;
          }

          return JSON.stringify(posts);
        } catch (e) {
          return `Erro ao buscar posts: ${e instanceof Error ? e.message : String(e)}`;
        }
      },
    });
  }

  //ferramenta para buscar a readlist pelo nome
  public createGetReadlistTool(): DynamicStructuredTool {

    const toolSchema = z.object({
      readlistName: z.string().describe('O nome ou slug da readlist para adicionar o livro; se não for especificada, pedir para especificar'),
    });
    return new DynamicStructuredTool({
      name: 'get_readlist',
      description: 'Encontra a readlist que o usuário esta procurando; retorna a readlist ou uma mensagem de erro.',
      schema: toolSchema,
      func: async ({ readlistName }: { readlistName: string }) => {
        try {
          const readlist = await this.readlistModel.findById(readlistName).exec();
          if (!readlist) {
            return `Readlist não encontrada: ${readlistName}`;
          }
        } catch (e) {
          return `Erro ao encontrar a readlist: ${e instanceof Error ? e.message : String(e)}`;
        }
      },
    });
  }

  // Ferramenta para adicionar livro na readlist
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

  // Ferramenta para remover livro da readlist
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

  // ferramenta para buscar livro pelo nome - ferramenta auxiliar (MOCK)
  public createFindLivroByNameTool(): DynamicStructuredTool {
    const toolSchema = z.object({
      livroName: z.string().describe("O nome do livro a ser buscado"),
    });
    return new DynamicStructuredTool({
      name: 'find_livro_by_name',
      description: 'Busca um livro pelo nome e retorna seu ID.',
      schema: toolSchema,
      func: async ({ livroName }) => {
        try {
          return `[MOCK] Encontrou o Livro ID 'livro_id_123' para '${livroName}'`; // Substitua pelo seu service
        } catch (e) { return `Erro: ${e.message}`; }
      },
    });
  }

  // ferramenta para buscar readlist pelo nome
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

  // Ferramenta para criar nova readlist
  public createCreateReadlistTool(userId: string): DynamicStructuredTool {
    const toolSchema = z.object({
      nome: z.string().describe("O nome da nova readlist a ser criada"),
      descricao: z.string().optional().describe("Uma breve descrição da readlist"),
      publica: z.boolean().default(false).describe("Se a readlist deve ser pública ou privada"),
    });

    return new DynamicStructuredTool({
      name: 'create_readlist',
      description: 'Cria uma nova readlist para o usuário.',
      schema: toolSchema,
      func: async ({ nome, descricao, publica }) => {
        try {
          const createDto = { nome, descricao, publica };
          const result = await this.readlistsService.create(userId, createDto);
          return `Readlist '${result.nome}' criada com sucesso com o ID: ${result._id}.`;
        } catch (e) { return `Erro ao criar readlist: ${e.message}`; }
      },
    });
  }

  // Ferramenta para deletar readlist
  public createDeleteReadlistTool(userId: string): DynamicStructuredTool {
    const toolSchema = z.object({
      readlistId: z.string().describe("O ID da readlist a ser deletada (obtido com 'find_readlist_by_name')"),
    });

    return new DynamicStructuredTool({
      name: 'delete_readlist',
      description: 'Deleta uma readlist do usuário usando o ID da readlist.',
      schema: toolSchema,
      func: async ({ readlistId }) => {
        try {
          await this.readlistsService.remove(userId, readlistId);
          return `Readlist (ID: ${readlistId}) foi deletada com sucesso.`;
        } catch (e) { return `Erro ao deletar readlist: ${e.message}`; }
      },
    });
  }

  // ferramenta para mostrar as readlists do usuário
  public createUsersGetMyReadlistsTool(userId: string): DynamicStructuredTool {
    return new DynamicStructuredTool({
      name: 'users_get_my_readlists',
      description: 'Obtém as readlists do usuário.',
      schema: z.object({}),
      func: async () => {
        try {
          return `[MOCK] Lista de readlists do usuário ${userId}. (Implementar com ReadlistsService)`;
        } catch (e) { return `Erro ao obter readlists: ${e.message}`; }
      },
    });
  }

  // Assumindo a existência de um 'LeiturasService' injetado
  public createGravarLeituraTool(userId: string): DynamicStructuredTool {
    const toolSchema = z.object({
      livroId: z.string().describe("O ID do livro (obtido com 'find_livro_by_name')"),
      status: z.enum(['quero-ler', 'lendo', 'lido']).describe("O status da leitura"),
    });

    return new DynamicStructuredTool({
      name: 'gravar_leitura',
      description: 'Registra o status de leitura de um livro (ex: "lido", "lendo").',
      schema: toolSchema,
      func: async ({ livroId, status }) => {
        try {
          return `[MOCK] Status '${status}' salvo para o livro ${livroId}. (Implementar com LeiturasService)`;
        } catch (e) { return `Erro ao gravar leitura: ${e.message}`; }
      },
    });
  }

  // Ferramenta para obter o perfil do usuário
  public createUsersGetMyProfileTool(userId: string): DynamicStructuredTool {
    return new DynamicStructuredTool({
      name: 'users_get_my_profile',
      description: 'Obtém o perfil do usuário autenticado.',
      schema: z.object({}),
      func: async () => {
        try {
          return `[MOCK] Perfil do usuário ${userId}. (Implementar com UsersService)`;
        } catch (e) { return `Erro ao obter perfil: ${e.message}`; }
      },
    });
  }

  // Ferramenta para obter os livros favoritos do usuário
  public createUsersGetMyFavoritesTool(userId: string): DynamicStructuredTool {

    return new DynamicStructuredTool({
      name: 'users_get_my_favorites',
      description: 'Obtém os livros favoritos do usuário.',
      schema: z.object({}),
      func: async () => {
        try {
          return `[MOCK] Lista de livros favoritos do usuário ${userId}. (Implementar com FavoritesService)`;
        } catch (e) { return `Erro ao obter favoritos: ${e.message}`; }
      },
    });
  }
}