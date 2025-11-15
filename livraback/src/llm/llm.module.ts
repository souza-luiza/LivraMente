import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LlmPromptService } from './writer/llm.prompt.service';
import { Story, StorySchema } from '../schemas/story.schema';
import { LlmApiService } from './writer/llm.api.service';
import { LlmController } from './llm.controller';
import { ConfigModule } from '@nestjs/config';
import { LlmStoryService } from './writer/llm.story.service';
import { LlmToolsService } from './assistant/llm.tools.service';
import { LlmAgentService } from './assistant/llm.agent.service';
import { Comunidade, ComunidadeSchema } from '../comunidades/entities/comunidade.entity'
import { Readlist, ReadlistSchema } from 'src/readlists/entities/readlist.entity';
import { ComunidadesModule } from 'src/comunidades/comunidades.module';
import { ReadlistsModule } from 'src/readlists/readlists.module';


@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Story.name, schema: StorySchema },
      { name: Comunidade.name, schema: ComunidadeSchema },
      { name: Readlist.name, schema: ReadlistSchema },
      ]
    ),
    ComunidadesModule,   // <-- add
    ReadlistsModule,     // <-- add
  ],
  providers: [LlmPromptService, LlmApiService, LlmStoryService, LlmToolsService, LlmAgentService],
  exports: [LlmPromptService, LlmApiService, LlmStoryService,],
  controllers: [LlmController] 
})
export class LlmModule {}