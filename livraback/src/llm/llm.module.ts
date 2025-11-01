import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LlmPromptService } from './llm-prompt.service';
import { Story, StorySchema } from '../schemas/story.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Story.name, schema: StorySchema }
    ])
  ],
  providers: [LlmPromptService],
  exports: [LlmPromptService] 
})
export class LlmModule {}