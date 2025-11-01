import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Define o tipo StoryDocument que combina Story com Document do Mongoose
export type StoryDocument = Story & Document;

@Schema({ timestamps: true })
export class Story {

  @Prop({ required: true }) 
  title: string;

  @Prop({ required: true })
  summary: string; 
}

export const StorySchema = SchemaFactory.createForClass(Story);