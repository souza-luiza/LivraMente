import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(), // carrega as variáveis do .env
    MongooseModule.forRoot(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@bancolivramente.h2qtpjf.mongodb.net/?retryWrites=true&w=majority&appName=BancoLivramente`),
    UsersModule],                                                                                
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
