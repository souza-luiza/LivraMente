import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Livro } from './livros/entities/livro.schema';
import { Autor } from './livros/entities/autor.schema';


const JA_ADICIONADOS = [
  /* 
  'Harry Potter e a Pedra Filosofal J.K. Rowling',
  'O Senhor dos Anéis | J.R.R. Tolkien',
  'O Hobbit | J.R.R. Tolkien',
  'Jogos Vorazes | Suzanne Collins',
  'A Culpa é das Estrelas | John Green',
  'Dom Casmurro | Machado de Assis',
  'O Poder do Hábito | Charles Duhigg',
  'Percy Jackson e o Mar de Monstros | Rick Riordan',
  'Percy Jackson e a Maldição do Titã | Rick Riordan',
  'Percy Jackson e a Batalha do Labirinto | Rick Riordan',
  'Percy Jackson e o Último Olimpiano | Rick Riordan',
  'A Seleção | Kiera Cass',
  'A Elite | Kiera Cass',
  'A Escolha | Kiera Cass',
  'A Herdeira | Kiera Cass',
  'A Coroa | Kiera Cass',
  'Harry Potter e o Cálice de Fogo | J.K. Rowling',
  'Harry Potter e a Ordem da Fênix | J.K. Rowling',
  'O Último Desejo | Andrzej Sapkowski',
  'A Espada do Destino | Andrzej Sapkowski',
  'O Sangue dos Elfos | Andrzej Sapkowski',
  'Tempo do Desprezo | Andrzej Sapkowski',
  'Batismo de Fogo | Andrzej Sapkowski',
  'A Torre da Andorinha | Andrzej Sapkowski',
  'A Senhora do Lago | Andrzej Sapkowski',
  'Tempo de Tempestade | Andrzej Sapkowski',
  'A Guerra dos Tronos | George R.R. Martin',
  'A Fúria dos Reis | George R.R. Martin',
  'A Tormenta de Espadas | George R.R. Martin',
  'O Festim dos Corvos | George R.R. Martin',
  'A Dança dos Dragões | George R.R. Martin',
  'Eragon | Christopher Paolini',
  'Eldest | Christopher Paolini',
  'Brisingr | Christopher Paolini',
  'Herança | Christopher Paolini',
  'Jantar Secreto | Raphael Montes',
  'Os Homens que Não Amavam as Mulheres | Stieg Larsson',
  'Divergente | Veronica Roth',
  'Insurgente | Veronica Roth',
  'Quatro | Veronica Roth',
  'Verity | Colleen Hoover',
  'Duna | Frank Herbert',
  'Fundação | Isaac Asimov',
  'O Verão que Mudou Minha Vida | Jenny Han',
  'Sem Você Não É Verão | Jenny Han',
  'Sempre Teremos o Verão | Jenny Han',
  'Para Todos os Garotos que Já Amei | Jenny Han',
  'P.S.: Ainda Amo Você | Jenny Han',
  'Agora e Para Sempre, Lara Jean | Jenny Han',
  'Corte de Espinhos e Rosas | Sarah J. Maas',
  'Corte de Névoa e Fúria | Sarah J. Maas',
  'Corte de Asas e Ruína | Sarah J. Maas',
  'Corte de Gelo e Estrelas | Sarah J. Maas',
  'Corte de Chamas Prateadas | Sarah J. Maas',
  'Coroa da Meia-Noite | Sarah J. Maas',
  'Herdeira do Fogo | Sarah J. Maas',
  'Rainha das Sombras | Sarah J. Maas',
  'Império de Tempestades | Sarah J. Maas',
  'Torre do Alvorecer | Sarah J. Maas',
  'Reino de Cinzas | Sarah J. Maas',
  'Os Sete Maridos de Evelyn Hugo | Taylor Jenkins Reid',
  'Daisy Jones and The Six | Taylor Jenkins Reid',
  'Amores Verdadeiros | Taylor Jenkins Reid',
  'Depois do Sim | Taylor Jenkins Reid',
  'Em Outra Vida, Talvez? | Taylor Jenkins Reid',
  'Malibu Renasce | Taylor Jenkins Reid',
  'Carrie Soto Está de Volta | Taylor Jenkins Reid',
  'É Assim que Acaba | Colleen Hoover',
  'É Assim que Começa | Colleen Hoover',
  'Verity | Colleen Hoover',
  'O Lado Feio do Amor | Colleen Hoover',
  'Talvez um Dia | Colleen Hoover',
  'Talvez Agora | Colleen Hoover',
  'Tarde Demais | Colleen Hoover',
  'Sem Esperança | Colleen Hoover',
  'Um Caso Perdido | Colleen Hoover',
  'Até o Verão Terminar | Colleen Hoover',
  'As Mil Partes do Meu Coração | Colleen Hoover',
  'Confesse | Colleen Hoover',
  'Métrica | Colleen Hoover',
  'Pausa | Colleen Hoover',
  'Essa Garota | Colleen Hoover',
  'Battle Royale | Koushun Takami',
  'A Biblioteca da Meia-Noite | Matt Haig',
  'A Hipótese do Amor | Ali Hazelwood',
  'A Razão do Amor | Ali Hazelwood',
  'A Teoria do Amor | Ali Hazelwood',
  'Odeio te Amar | Ali Hazelwood',
  'Amor, Teoricamente | Ali Hazelwood',
  'Presságios do Amor | Alexandria Bellefleur',
  'Morte no Nilo | Agatha Christie',
  'Assassinato no Expresso do Oriente | Agatha Christie',
  'Um Corpo na Biblioteca | Agatha Christie',
  "Fazendo Meu Filme 1: A Estreia de Fani | Paula Pimenta",
  "Fazendo Meu Filme 3: O Roteiro Inesperado de Fani | Paula Pimenta",
  "Fazendo Meu Filme 4: Fani em Busca do Final Feliz | Paula Pimenta",
  "Iracema | José de Alencar",
  "Capitães da Areia | Jorge Amado",
  "Dom Casmurro | Machado de Assis",
  "Memórias Póstumas de Brás Cubas | Machado de Assis",
  "Quincas Borba | Machado de Assis",
  "Helena | Machado de Assis",
  "O Alienista | Machado de Assis",
  "O Senhor dos Anéis: A Sociedade do Anel | J.R.R. Tolkien",
  "O Senhor dos Anéis: As Duas Torres | J.R.R. Tolkien",
  "O Senhor dos Anéis: O Retorno do Rei | J.R.R. Tolkien",
  */
];

// Lista de livros populares para buscar
const LIVROS_POPULARES = [
  
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

async function buscarLivroGoogleBooks(busca: string): Promise<GoogleBookItem | null> {
  try {
    const [tituloOriginal, autorOriginal] = busca.split('|').map(s => s.trim());
    const tituloLower = tituloOriginal.toLowerCase();
    const autorLower = autorOriginal.toLowerCase();

    const q = `intitle:"${tituloOriginal}"+inauthor:"${autorOriginal}"`;
    const query = encodeURIComponent(q);

    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    const keyParam = apiKey ? `&key=${apiKey}` : '';
    const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&langRestrict=pt&maxResults=20${keyParam}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      console.log("   ❌ Nenhum resultado retornado pela API.");
      return null;
    }

    const items = data.items as GoogleBookItem[];

    // Helper: só aceita resultados com capa
    const comCapa = (item: GoogleBookItem) =>
      !!item.volumeInfo.imageLinks?.thumbnail;

    // ---------------------------------------
    // 1️⃣ PRIORIDADE: TÍTULO EXATO + CAPA
    // ---------------------------------------
    const matchExato = items.find(item => {
      const title = item.volumeInfo.title?.toLowerCase() ?? "";
      return title === tituloLower && comCapa(item);
    });

    if (matchExato) {
      console.log("   🎯 Título exato encontrado com capa!");
      return matchExato;
    }

    // ---------------------------------------
    // 2️⃣ TÍTULO COMEÇA IGUAL + CAPA
    // ---------------------------------------
    const matchInicial = items.find(item => {
      const title = item.volumeInfo.title?.toLowerCase() ?? "";
      return title.startsWith(tituloLower) && comCapa(item);
    });

    if (matchInicial) {
      console.log("   🎯 Título inicia igual com capa.");
      return matchInicial;
    }

    // ---------------------------------------
    // 3️⃣ FILTRO NORMAL — EXIGE CAPA
    // ---------------------------------------
    const filtrados = items.filter(item => {
      const info = item.volumeInfo;

      if (!comCapa(item)) return false;
      if ((info.pageCount || 0) < 20) return false;
      if (!info.authors?.some(a => a.toLowerCase().includes(autorLower))) return false;

      const title = info.title?.toLowerCase() ?? "";
      return title.includes(tituloLower.substring(0, 4));
    });

    if (filtrados.length > 0) {
      console.log("   🎯 Resultado filtrado com capa.");
      return filtrados[0];
    }

    // ---------------------------------------
    // 4️⃣ ÚLTIMO FALLBACK — SOMENTE SE TIVER CAPA
    // ---------------------------------------
    const fallbackComCapa = items.find(comCapa);

    if (fallbackComCapa) {
      console.log("   ⚠️ Usando fallback com capa.");
      return fallbackComCapa;
    }

    console.log("   ❌ Nenhum resultado com capa encontrado.");
    return null;

  } catch (error) {
    console.error(`Erro ao buscar livro "${busca}":`, error);
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

      // Impede salvar livro sem capa
      if (!volumeInfo.imageLinks?.thumbnail) {
        console.log("   ❌ Livro ignorado porque não possui capa.\n");
        continue;
      }

      const novoLivro = await livroModel.create({
        titulo: volumeInfo.title,
        isbn: isbn,
        autores: autoresIds,
        editora: volumeInfo.publisher,
        ano_publicacao: volumeInfo.publishedDate
          ? parseInt(volumeInfo.publishedDate.split('-')[0])
          : undefined,
        sinopse: volumeInfo.description,
        numero_paginas: volumeInfo.pageCount || undefined,  // nunca salva null
        generos: volumeInfo.categories || [],
        capa_url: volumeInfo.imageLinks.thumbnail.replace('http://', 'https://'),
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
