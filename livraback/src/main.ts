import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove propriedades não permitidas
      forbidNonWhitelisted: true, // lança erro se propriedades extras forem passadas
      transform: true, // transforma tipos automaticamente (ex: string para number)
    })
  )
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
