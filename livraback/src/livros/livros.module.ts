import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Livro, LivroSchema } from './entities/livro.schema';
import { Autor, AutorSchema } from './entities/autor.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: Livro.name, schema: LivroSchema }, { name: Autor.name, schema: AutorSchema }])],
    exports: [MongooseModule]
})
export class LivrosModule {}
