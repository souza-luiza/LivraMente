import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

// Importar todos os schemas
import { Livro, LivroSchema } from './schemas/livro.schema';
import { Autor, AutorSchema } from './schemas/autor.schema';
import { Post, PostSchema } from './schemas/post.schema';
import { Comentario, ComentarioSchema } from './schemas/comentario.schema';
import { CommentsModule } from './comments/comments.module';
import { Quiz, QuizSchema } from './schemas/quiz.schema';
import { Resenha, ResenhaSchema } from './schemas/resenha.schema';
import { ReadlistsModule } from './readlists/readlists.module';
import { PostsModule } from './posts/posts.module';
import { ComunidadesModule } from './comunidades/comunidades.module';
import { LlmModule } from './llm/llm.module';
import { QueueModule } from './queue/queue.module';
import { NotificacoesModule } from './notificacoes/notificacoes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // carrega as variáveis do .env
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow('DB_URL'),
      }),
    }),
    // Registrar todos os schemas
    MongooseModule.forFeature([
      { name: Livro.name, schema: LivroSchema },
      { name: Autor.name, schema: AutorSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comentario.name, schema: ComentarioSchema },
      { name: Quiz.name, schema: QuizSchema },
      { name: Resenha.name, schema: ResenhaSchema }
    ]),
    UsersModule,
    AuthModule,
    ReadlistsModule,
    PostsModule,
    ComunidadesModule,
    CommentsModule,
    LlmModule,
    QueueModule,
    NotificacoesModule,
  ],                                                                                
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
