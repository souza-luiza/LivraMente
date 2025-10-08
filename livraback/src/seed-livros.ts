import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Livro } from './schemas/livro.schema';
import { Autor } from './schemas/autor.schema';


const JA_ADICIONADOS = [
  // 'Harry Potter e a Pedra Filosofal J.K. Rowling',
];

// Lista de livros populares para buscar
// IMPORTANTE: Inclua o autor para melhorar a busca!
const LIVROS_POPULARES = [
  // Fantasia
  'Harry Potter e a Pedra Filosofal J.K. Rowling',
  'Harry Potter e a Câmara Secreta J.K. Rowling',
  'Harry Potter e o Prisioneiro de Azkaban J.K. Rowling',
  'O Senhor dos Anéis J.R.R. Tolkien',
  'O Hobbit J.R.R. Tolkien',
  'As Crônicas de Nárnia C.S. Lewis',
  'Percy Jackson e o Ladrão de Raios Rick Riordan',
  'Eragon Christopher Paolini',
  
  // Distopia/Ficção Científica
  '1984 George Orwell',
  'Fahrenheit 451 Ray Bradbury',
  'Jogos Vorazes Suzanne Collins',
  'Divergente Veronica Roth',
  'Maze Runner James Dashner',
  'Admirável Mundo Novo Aldous Huxley',
  
  // Romance/Drama
  'A Culpa é das Estrelas John Green',
  'Para Todos os Garotos que Já Amei Jenny Han',
  'O Lado Feio do Amor Colleen Hoover',
  'É Assim que Acaba Colleen Hoover',
  'Extraordinário R.J. Palacio',
  
  // Clássicos Brasileiros
  'Dom Casmurro Machado de Assis',
  'Grande Sertão Veredas Guimarães Rosa',
  'Capitães da Areia Jorge Amado',
  'O Cortiço Aluísio Azevedo',
  'Memórias Póstumas de Brás Cubas Machado de Assis',
  
  // Autoajuda/Desenvolvimento
  'O Poder do Hábito Charles Duhigg',
  'Mindset Carol Dweck',
  'Inteligência Emocional Daniel Goleman',
  'Rápido e Devagar Daniel Kahneman',
];

interface GoogleBookItem {
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    publishedDate?: string;
    publisher?: string;
    pageCount?: number;
    categories?: string[];
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
  };
}

async function buscarLivroGoogleBooks(titulo: string): Promise<GoogleBookItem | null> {
  try {
    const query = encodeURIComponent(titulo);
    
    // Usar API key 
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    const keyParam = apiKey ? `&key=${apiKey}` : '';
    
    // Buscar mais resultados para filtrar melhor
    const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&langRestrict=pt&maxResults=5${keyParam}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      // Filtrar: preferir livros com mais de 50 páginas (evita resumos/análises)
      const livrosValidos = data.items.filter((item: GoogleBookItem) => {
        const pageCount = item.volumeInfo.pageCount || 0;
        return pageCount >= 50; // Filtra livros muito pequenos
      });
      
      if (livrosValidos.length > 0) {
        return livrosValidos[0]; // Retorna o primeiro resultado válido
      }
      
      // Se nenhum passou no filtro, retorna o primeiro mesmo assim
      console.log(`   ⚠️  Nenhum livro com 50+ páginas encontrado, usando primeiro resultado`);
      return data.items[0];
    }
    return null;
  } catch (error) {
    console.error(`Erro ao buscar livro "${titulo}":`, error);
    return null;
  }
}

async function seedLivros() {
  console.log('🌱 Iniciando seed de livros...\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const livroModel = app.get<Model<Livro>>(getModelToken(Livro.name));
  const autorModel = app.get<Model<Autor>>(getModelToken(Autor.name));

  let sucessos = 0;
  let erros = 0;

  for (const tituloLivro of LIVROS_POPULARES) {
    console.log(`📖 Buscando: ${tituloLivro}...`);
    
    const bookData = await buscarLivroGoogleBooks(tituloLivro);
    
    if (!bookData) {
      console.log(`   ❌ Não encontrado\n`);
      erros++;
      continue;
    }

    const { volumeInfo } = bookData;

    // Verificar se o livro já existe
    const isbn = volumeInfo.industryIdentifiers?.find(id => 
      id.type === 'ISBN_13' || id.type === 'ISBN_10'
    )?.identifier || `NO-ISBN-${Date.now()}`;

    const livroExistente = await livroModel.findOne({ isbn });
    if (livroExistente) {
      console.log(`   ⏭️  Já existe no banco\n`);
      continue;
    }

    try {
      // Criar ou buscar autores
      const autoresIds: any[] = [];
      if (volumeInfo.authors && volumeInfo.authors.length > 0) {
        for (const nomeAutor of volumeInfo.authors) {
          let autor = await autorModel.findOne({ nome: nomeAutor });
          
          if (!autor) {
            autor = await autorModel.create({
              nome: nomeAutor,
              livros: [], // Inicializa array vazio
            });
            console.log(`   👤 Autor criado: ${nomeAutor}`);
          }
          
          autoresIds.push(autor._id);
        }
      }

      // Criar livro
      const novoLivro = await livroModel.create({
        titulo: volumeInfo.title,
        isbn: isbn,
        autores: autoresIds,
        editora: volumeInfo.publisher,
        ano_publicacao: volumeInfo.publishedDate 
          ? parseInt(volumeInfo.publishedDate.split('-')[0]) 
          : undefined,
        sinopse: volumeInfo.description,
        numero_paginas: volumeInfo.pageCount,
        generos: volumeInfo.categories || [],
        capa_url: volumeInfo.imageLinks?.thumbnail?.replace('http://', 'https://'),
      });

      // Atualizar autores com referência ao livro (relacionamento bidirecional)
      for (const autorId of autoresIds) {
        await autorModel.findByIdAndUpdate(
          autorId,
          { $addToSet: { livros: novoLivro._id } }, // $addToSet evita duplicatas
        );
      }

      console.log(`   ✅ Livro criado: ${novoLivro.titulo}`);
      console.log(`   📚 ISBN: ${isbn}`);
      console.log(`   📄 Páginas: ${volumeInfo.pageCount || 'N/A'}\n`);
      sucessos++;

      // Delay para não sobrecarregar a API
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.log(`   ❌ Erro ao criar livro:`, error.message, '\n');
      erros++;
    }
  }

  console.log('\n=================================');
  console.log(`✅ Seed concluído!`);
  console.log(`📊 Sucessos: ${sucessos}`);
  console.log(`❌ Erros: ${erros}`);
  console.log(`📚 Total tentados: ${LIVROS_POPULARES.length}`);
  console.log('=================================\n');

  await app.close();
  process.exit(0);
}

seedLivros().catch(error => {
  console.error('❌ Erro fatal no seed:', error);
  process.exit(1);
});
