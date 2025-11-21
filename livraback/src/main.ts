import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  if (!process.env.DB_URL) throw new Error('DB_URL não definido');
  if (!process.env.SESSION_SECRET) throw new Error('SESSION_SECRET não definido');

  await mongoose.connect(process.env.DB_URL);

  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove propriedades não permitidas
      forbidNonWhitelisted: true, // lança erro se propriedades extras forem passadas
      transform: true, // transforma tipos automaticamente (ex: string para number)
    })
  )

  app.use(
    session({
      store: MongoStore.create({
        mongoUrl: process.env.DB_URL
      }),
      name: 'sessionId',
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: true,
        maxAge: 1000 * 60 * 60 * 24, // 1 dia
      },
    }),
  );

  // ########################## SWAGGER #################################
  const config = new DocumentBuilder()
    .setTitle('API LivraMente')
    .setDescription('Documentação - API LivraMente')
    .setVersion('1.0')
    .addCookieAuth('sessionId')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  // ####################################################################

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();