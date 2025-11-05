import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
  app.enableCors({
    origin: allowedOrigins,  
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove propriedades não permitidas
      forbidNonWhitelisted: true, // lança erro se propriedades extras forem passadas
      transform: true, // transforma tipos automaticamente (ex: string para number)
    })
  )

  // ########################## SWAGGER #################################
  const config = new DocumentBuilder()
    .setTitle('API LivraMente')
    .setDescription('Documentação - API LivraMente')
    .setVersion('1.0')
    .addBearerAuth() // adiciona suporte ao token JWT
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  // ####################################################################

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();