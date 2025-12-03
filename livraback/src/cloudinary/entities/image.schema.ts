import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ _id: false })
export class CloudinaryImage {
  @Prop({ required: true })
  secure_url: string;

  @Prop({ required: true })
  public_id: string;
}

export const CloudinaryImageSchema = SchemaFactory.createForClass(CloudinaryImage);