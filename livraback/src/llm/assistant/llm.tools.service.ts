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
}
