import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LlmPromptService } from './llm-prompt.service';
import { Story, StorySchema } from '../schemas/story.schema';
import { LlmApiService } from './llm.api.service';
import { LlmController } from './llm.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Story.name, schema: StorySchema }
    ])
  ],
  providers: [LlmPromptService, LlmApiService],
  exports: [LlmPromptService, LlmApiService],
  controllers: [LlmController] 
})
export class LlmModule {}