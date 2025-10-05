//collections dentro do mongo
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>; // referencia de userDocument fica User

@Schema()
export class User {
    @Prop()
    name: string;

    @Prop() // "colunas" da tabela
    email: string;

    @Prop()
    password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);