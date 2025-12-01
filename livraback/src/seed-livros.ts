import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Livro } from './livros/entities/livro.schema';
import { Autor } from './livros/entities/autor.schema';


const JA_ADICIONADOS = [
  /* 
  'Harry Potter e a Pedra Filosofal | J.K. Rowling',
  'Harry Potter e a Câmara Secreta | J.K. Rowling',
  'Harry Potter e o Prisioneiro de Azkaban | J.K. Rowling | 1781103704', 
  'Harry Potter e o Cálice de Fogo | J.K. Rowling',
  'Harry Potter e a Ordem da Fênix | J.K. Rowling',
  'Harry Potter e o Enigma do Príncipe | J.K. Rowling',
  'Harry Potter e as Relíquias da Morte | J.K. Rowling | 1781104069'
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
  'Fazendo meu filme 2 | Paula Pimenta | 8582356129',
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
  "Eu e Esse Meu Coração | C. C. Hunter | 9788555391262",
  "Eleanor & Park | Rainbow Rowell",
  "A Cinco Passos de Você | Rachael Lippincott",
  "Todo Esse Tempo | Rachael Lippincott",
  "Um de nós está mentindo | Karen McManus | 9788501114181",
  "Um de nós é o próximo | Karen McManus | 9786555872156",
  "Cidades de papel | John Green | 9788580573916",
  "A vida invisível de Addie LaRue | V. E. Schwab | 9786559810475",
  "A paciente silenciosa | Alex Michaelides | 9788501116536",
  "A rainha vermelha | Victoria Aveyard | 9788543803548",
  "Espada de vidro | Victoria Aveyard | 9788543804989",
  "A prisão do rei | Victoria Aveyard | 9788543808338",
  "Tempestade de guerra | Victoria Aveyard | 9788554511418",
  */
];

// Lista de livros populares para buscar (agora aceita ISBN opcional no final)
const LIVROS_POPULARES: string[] = [

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

function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-');
}

async function generateUniqueSlug(livroModel: Model<Livro>, base: string): Promise<string> {
  let slug = base;
  let counter = 1;

  while (true) {
    const exists = await livroModel.findOne({ slug });
    if (!exists) return slug;
    counter++;
    slug = `${base}-${counter}`;
  }
}

// Busca por ISBN primeiro
async function buscarPorISBN(isbn: string): Promise<GoogleBookItem | null> {
  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      console.log(`   ❌ Nenhum resultado via ISBN (${isbn})`);
      return null;
    }

    const item = data.items[0] as GoogleBookItem;
    if (!item.volumeInfo.imageLinks?.thumbnail) {
      console.log(`   ❌ ISBN encontrado, mas sem capa`);
      return null;
    }

    console.log(`   🎯 Encontrado via ISBN (${isbn}) com capa!`);
    return item;

  } catch (err) {
    console.log(`   ⚠️ Erro buscando por ISBN:`, err);
    return null;
  }
}

// Busca antiga por título e autor
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

    const comCapa = (item: GoogleBookItem) => !!item.volumeInfo.imageLinks?.thumbnail;

    const matchExato = items.find(item =>
      item.volumeInfo.title?.toLowerCase() === tituloLower && comCapa(item)
    );
    if (matchExato) {
      console.log("   🎯 Título exato encontrado com capa!");
      return matchExato;
    }

    const matchInicial = items.find(item =>
      item.volumeInfo.title?.toLowerCase().startsWith(tituloLower) && comCapa(item)
    );
    if (matchInicial) {
      console.log("   🎯 Título inicia igual com capa.");
      return matchInicial;
    }

    const filtrados = items.filter(item => {
      const info = item.volumeInfo;
      if (!comCapa(item)) return false;
      if ((info.pageCount || 0) < 20) return false;
      if (!info.authors?.some(a => a.toLowerCase().includes(autorLower))) return false;
      return info.title?.toLowerCase().includes(tituloLower.substring(0, 4));
    });

    if (filtrados.length > 0) {
      console.log("   🎯 Resultado filtrado com capa.");
      return filtrados[0];
    }

    const fallback = items.find(comCapa);
    if (fallback) {
      console.log("   ⚠️ Usando fallback com capa.");
      return fallback;
    }

    console.log("   ❌ Nenhum resultado com capa encontrado.");
    return null;

  } catch (error) {
    console.error(`Erro ao buscar livro "${busca}":`, error);
    return null;
  }
}

// Seed principal
async function seedLivros() {
  console.log('🌱 Iniciando seed de livros...\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const livroModel = app.get<Model<Livro>>(getModelToken(Livro.name));
  const autorModel = app.get<Model<Autor>>(getModelToken(Autor.name));

  let sucessos = 0;
  let erros = 0;

  for (const entrada of LIVROS_POPULARES) {
    console.log(`📖 Buscando: ${entrada}...`);

    const partes = entrada.split('|').map(v => v.trim());
    const titulo = partes[0];
    const autor = partes[1];
    const isbnInformado = partes[2] ?? null;

    let bookData: GoogleBookItem | null = null;

    // tenta via ISBN
    if (isbnInformado) {
      console.log(`   🔍 Tentando buscar via ISBN: ${isbnInformado}`);
      bookData = await buscarPorISBN(isbnInformado);
    }

    // fallback via título
    if (!bookData) {
      console.log(`   🔍 Buscando via título e autor...`);
      bookData = await buscarLivroGoogleBooks(`${titulo} | ${autor}`);
    }

    if (!bookData) {
      console.log(`   ❌ Não encontrado\n`);
      erros++;
      continue;
    }

    const { volumeInfo } = bookData;

    const isbn = volumeInfo.industryIdentifiers?.find(id =>
      id.type === 'ISBN_13' || id.type === 'ISBN_10'
    )?.identifier || isbnInformado || `NO-ISBN-${Date.now()}`;

    const livroExistente = await livroModel.findOne({ isbn });
    if (livroExistente) {
      console.log(`   ⏭️  Já existe no banco\n`);
      continue;
    }

    try {
      const autoresIds: any[] = [];

      if (volumeInfo.authors?.length) {
        for (const nomeAutor of volumeInfo.authors) {
          let autorDoc = await autorModel.findOne({ nome: nomeAutor });
          if (!autorDoc) {
            autorDoc = await autorModel.create({ nome: nomeAutor, livros: [] });
            console.log(`   👤 Autor criado: ${nomeAutor}`);
          }
          autoresIds.push(autorDoc._id);
        }
      }

      if (!volumeInfo.imageLinks?.thumbnail) {
        console.log("   ❌ Livro ignorado porque não possui capa.\n");
        continue;
      }

      const baseSlug = slugify(volumeInfo.title);
      const slugUnico = await generateUniqueSlug(livroModel, baseSlug);

      const novoLivro = await livroModel.create({
        titulo: volumeInfo.title,
        isbn,
        autores: autoresIds,
        editora: volumeInfo.publisher,
        ano_publicacao: volumeInfo.publishedDate?.split('-')[0],
        sinopse: volumeInfo.description,
        numero_paginas: volumeInfo.pageCount,
        generos: volumeInfo.categories || [],
        capa_url: volumeInfo.imageLinks.thumbnail.replace('http://', 'https://'),
        slug: slugUnico,
      });

      for (const autorId of autoresIds) {
        await autorModel.findByIdAndUpdate(autorId, {
          $addToSet: { livros: novoLivro._id }
        });
      }

      console.log(`   ✅ Livro criado: ${novoLivro.titulo}`);
      console.log(`   📚 ISBN: ${isbn}`);
      console.log(`   🔗 Slug: ${slugUnico}`);
      console.log(`   📄 Páginas: ${volumeInfo.pageCount || 'N/A'}\n`);

      sucessos++;

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

seedLivros().catch(err => {
  console.error('❌ Erro fatal no seed:', err);
  process.exit(1);
});