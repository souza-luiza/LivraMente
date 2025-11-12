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

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Story.name, schema: StorySchema }
    ])
  ],
  providers: [LlmPromptService, LlmApiService, LlmStoryService, LlmToolsService, LlmAgentService],
  exports: [LlmPromptService, LlmApiService, LlmStoryService],
  controllers: [LlmController] 
})
export class LlmModule {}