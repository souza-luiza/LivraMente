import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Story, StoryDocument } from '../../schemas/story.schema';
import { Comunidade, ComunidadeDocument } from 'src/comunidades/entities/comunidade.entity';

@Injectable()
export class LlmToolsService {
  constructor(
    @InjectModel(Story.name) private storyModel: Model<StoryDocument>,
    @InjectModel(Comunidade.name) private communityModel: Model<ComunidadeDocument>,
  ) { }

  //ferramenta para buscar as histórias do usuário logado
  public createGetUserStoriesTool(userId: string): any {
    return {
      name: 'get_user_stories',
      description: 'Busca todas as histórias (título e resumo) criadas pelo usuário logado.',
      func: async () => {
        try {
          const stories = await this.storyModel.find({ userId }).select('title summary').limit(50).exec();
          return JSON.stringify(stories);
        } catch (e) {
          return `Erro ao buscar histórias: ${e instanceof Error ? e.message : String(e)}`;
        }
      }
    };
  }

  //ferramenta para buscar as n comunidades mais populares
  public createGetPopularCommunitiesTool(): any {

    const toolSchema = z.object({
      count: z.number().default(5).describe("O número de comunidades a buscar"),
    });

    return {
      name: 'get_popular_communities',
      description: 'Busca as "count" comunidades mais populares do site Livramente. Se o usuário não especificar um número, o padrão é 5.',
      args: toolSchema,
      func: async ({ count }: { count: number }) => {
        try {
          const comunidades = await this.communityModel.find()
            .sort({ members: -1 })
            .limit(count) //é dinâmico
            .exec();
          return JSON.stringify(comunidades);
        } catch (e) {
          return `Erro ao buscar comunidades: ${e instanceof Error ? e.message : String(e)}`;
        }
      },
    };
  }

  //ferramenta para buscar as n histórias mais recentes
  public createGetRecentStoriesTool(): any {

    const toolSchema = z.object({
      count: z.number().default(3).describe("O número de histórias a buscar"),
    });

    return {
      name: 'get_recent_stories',
      description: 'Busca as "count" histórias mais recentes criadas no site Livramente. Se o usuário não especificar um número, o padrão é 3.',
      args: toolSchema,
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
    };
  }

  //ferramenta para entrar na comunidade
  public createJoinCommunityTool(): any {

    const toolSchema = z.object({
      communityId: z.string().describe("O ID da comunidade que o usuário deseja entrar"),
      userId: z.string().describe("O ID do usuário que deseja entrar na comunidade"),
    });

    return {
      name: 'join_community',
      description: 'Adiciona o usuário especificado à comunidade indicada; retorna a comunidade atualizada ou uma mensagem de erro.',
      args: toolSchema,
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
    };
  }

  //ferramenta para achar comunidade
  public createGetCommunitiesTool(): any {

    const toolSchema = z.object({
      communityId: z.string().describe("O ID da comunidade que o usuário deseja encontrar"),
    });

    return {
      name: 'get_community',
      description: 'Encontra a comunidade que o usuário esta procurando; retorna a comunidade ou uma mensagem de erro.',
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
    };
  }

  //ferramenta para sair da comunidade
  //obs.: rever essa ferramenta que podera ser usado por moderador da comunidade
  public createLeaveCommunityTool(userId: string): any {
    const toolSchema = z.object({
      communityId: z.string().describe("O ID da comunidade que o usuário deseja sair"),
    });

    return {
      name: 'leave_community',
      description: 'Remove o usuário autenticado da comunidade indicada; retorna a comunidade atualizada ou uma mensagem de erro.',
      args: toolSchema,
      func: async ({ communityId }: { communityId: string }) => {
        try {
          const community = await this.communityModel.findById(communityId).exec();
          if (!community) return `Community not found: ${communityId}`;

          // verifica se já é membro
          if (!community.membros?.includes(userId as any)) {
            return `User ${userId} is not a member of community ${communityId}`;
          }

          const updated = await this.communityModel.findByIdAndUpdate(
            communityId,
            { $pull: { membros: userId } },
            { new: true }
          ).exec();

          return JSON.stringify(updated);
        } catch (e) {
          return `Error leaving community: ${e instanceof Error ? e.message : String(e)}`;
        }
      },
    };
  }

  //ferramenta para buscar os posts mais populares da comunidade
  // rever sobre essa ferramenta e ver se da para usar em uma parte específica do feed
  public createGetPopularPostsCommunityTool(): any {

    const toolSchema = z.object({
      communityId: z.string().optional().describe("O ID da comunidade; se não fornecido, busca no site inteiro"),
      count: z.number().default(10).describe("Número máximo de posts a retornar"),
    });

    return {
      name: 'get_popular_posts_in_community',
      description: 'Busca os posts mais populares. Se communityId não for informado, pedir para informar a comunidade específica.',
      args: toolSchema,
      func: async ({ communityId, count }: { communityId?: string; count: number }) => {
        try {
          // busca por comunidade específica
          const community = await this.communityModel.findById(communityId).exec();
          if (!community) {
            return `Comunidade não encontrada: ${communityId}`;
          }

          const posts = await this.storyModel
            .find({ communityId })
            .sort({ likes: -1, views: -1, createdAt: -1 })
            .limit(count)
            .select('title summary likes views createdAt')
            .exec();

          if (!posts || posts.length === 0) {
            return `Nenhum post encontrado na comunidade: ${communityId}`;
          }

          return JSON.stringify(posts);
        } catch (e) {
          return `Erro ao buscar posts na comunidade: ${e instanceof Error ? e.message : String(e)}`;
        }
      },
    };
  }
}
