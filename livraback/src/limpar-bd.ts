import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Livro } from './livros/entities/livro.schema';
import { Autor } from './livros/entities/autor.schema';

async function limparBanco() {
  console.log('🧹 Iniciando limpeza do banco de dados...\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const livroModel = app.get<Model<Livro>>(getModelToken(Livro.name));
  const autorModel = app.get<Model<Autor>>(getModelToken(Autor.name));

  try {
    // Deletar todos os livros
    const livrosCount = await livroModel.countDocuments();
    await livroModel.deleteMany({});
    console.log(`✅ ${livrosCount} livros deletados`);

    // Deletar todos os autores
    const autoresCount = await autorModel.countDocuments();
    await autorModel.deleteMany({});
    console.log(`✅ ${autoresCount} autores deletados`);

    console.log('\n✅ Banco limpo com sucesso!\n');
  } catch (error) {
    console.error('❌ Erro ao limpar banco:', error);
  }

  await app.close();
  process.exit(0);
}

limparBanco().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
