import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Story, StoryDocument } from '../../schemas/story.schema';
import { Comunidade, ComunidadeDocument } from 'src/comunidades/entities/comunidade.entity';
import { ComunidadesService } from 'src/comunidades/comunidades.service';
import { DynamicStructuredTool } from 'langchain';

@Injectable()
export class LlmToolsService {
  constructor(
    @InjectModel(Story.name) private storyModel: Model<StoryDocument>,
    @InjectModel(Comunidade.name) private communityModel: Model<ComunidadeDocument>,
    private comunidadesService: ComunidadesService,
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
  public createGetPopularPostsCommunityTool(): DynamicStructuredTool {

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
}
