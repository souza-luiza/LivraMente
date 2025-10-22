// Script para criar readlists de teste no banco de dados
// Execute: node create-test-readlists.js

const API_BASE_URL = 'http://localhost:3001';

// Dados de teste - ajuste conforme seu usuário
const TEST_USER = {
  email: 'teste@exemplo.com',
  senha: 'senha123'
};

// Readlists de teste
const TEST_READLISTS = [
  {
    nome: 'Teste',
    descricao: 'Readlist de teste criada pelo script',
    publica: true,
    favorito: false,
    capa_url: 'https://picsum.photos/400/600'
  },
  {
    nome: 'Favoritos de 2024',
    descricao: 'Meus livros favoritos do ano',
    publica: true,
    favorito: true,
    capa_url: 'https://picsum.photos/400/601'
  },
  {
    nome: 'Para Ler',
    descricao: 'Lista de livros que quero ler em breve',
    publica: false,
    favorito: false,
    capa_url: 'https://picsum.photos/400/602'
  },
  {
    nome: 'Clássicos',
    descricao: 'Grandes clássicos da literatura',
    publica: true,
    favorito: false,
    capa_url: 'https://picsum.photos/400/603'
  }
];

async function login() {
  console.log('🔐 Fazendo login...');
  
  const response = await fetch(`${API_BASE_URL}/auth/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(TEST_USER),
  });

  if (!response.ok) {
    throw new Error(`Login falhou: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log('✅ Login realizado com sucesso!');
  return data.accessToken;
}

async function createReadlist(token, readlistData) {
  console.log(`📚 Criando readlist: ${readlistData.nome}...`);
  
  const response = await fetch(`${API_BASE_URL}/readlists`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(readlistData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erro ao criar readlist: ${response.status} - ${error}`);
  }

  const data = await response.json();
  console.log(`✅ Readlist "${data.nome}" criada com ID: ${data._id}`);
  return data;
}

async function main() {
  try {
    console.log('🚀 Iniciando criação de readlists de teste...\n');

    // 1. Fazer login
    const token = await login();
    console.log('');

    // 2. Criar readlists
    const createdReadlists = [];
    for (const readlist of TEST_READLISTS) {
      try {
        const created = await createReadlist(token, readlist);
        createdReadlists.push(created);
      } catch (error) {
        console.error(`❌ Erro ao criar "${readlist.nome}":`, error.message);
      }
    }

    console.log('\n✨ Processo concluído!');
    console.log(`📊 Total de readlists criadas: ${createdReadlists.length}/${TEST_READLISTS.length}`);
    
    if (createdReadlists.length > 0) {
      console.log('\n📋 Readlists criadas:');
      createdReadlists.forEach(rl => {
        console.log(`   - ${rl.nome} (${rl.publica ? 'Pública' : 'Privada'})`);
      });
    }

    console.log('\n💡 Você pode acessar as readlists em:');
    console.log('   http://localhost:3000/{seu-username}/readlist/teste');
    console.log('   http://localhost:3000/{seu-username}/readlist/favoritos-de-2024');
    console.log('   etc...\n');

  } catch (error) {
    console.error('\n❌ Erro fatal:', error.message);
    console.log('\n📝 Dicas:');
    console.log('   1. Verifique se o backend está rodando (http://localhost:3001)');
    console.log('   2. Certifique-se que o usuário existe no banco');
    console.log('   3. Ajuste TEST_USER no início do script com credenciais válidas');
    process.exit(1);
  }
}

main();
