// Script completo para setup de teste - cria usuário e readlists
// Execute: node setup-test-data.js

const API_BASE_URL = 'http://localhost:3001';

const TEST_USER = {
  username: 'gatanoturna',
  email: 'teste@exemplo.com',
  senha: 'senha123'
};

const TEST_READLISTS = [
  {
    nome: 'Teste',
    descricao: 'Readlist de teste criada pelo script. Você pode editar e testar todas as funcionalidades!',
    publica: true,
    favorito: false,
    capa_url: 'https://picsum.photos/400/600'
  },
  {
    nome: 'Favoritos de 2024',
    descricao: 'Meus livros favoritos do ano. Esta readlist é pública e marcada como favorita.',
    publica: true,
    favorito: true,
    capa_url: 'https://picsum.photos/400/601'
  },
  {
    nome: 'Para Ler',
    descricao: 'Lista de livros que quero ler em breve. Esta é uma readlist privada.',
    publica: false,
    favorito: false,
    capa_url: 'https://picsum.photos/400/602'
  },
  {
    nome: 'Clássicos da Literatura',
    descricao: 'Grandes clássicos que todos deveriam ler. Machado de Assis, José Saramago, Clarice Lispector e mais.',
    publica: true,
    favorito: false,
    capa_url: 'https://picsum.photos/400/603'
  },
  {
    nome: 'Ficção Científica',
    descricao: 'Os melhores livros de ficção científica. Isaac Asimov, Arthur C. Clarke, Philip K. Dick.',
    publica: true,
    favorito: true,
    capa_url: 'https://picsum.photos/400/604'
  }
];

async function createUser() {
  console.log('👤 Criando usuário de teste...');
  
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(TEST_USER),
  });

  if (!response.ok) {
    const error = await response.text();
    if (response.status === 409 || error.includes('já existe')) {
      console.log('ℹ️  Usuário já existe, continuando...');
      return { exists: true };
    }
    throw new Error(`Erro ao criar usuário: ${response.status} - ${error}`);
  }

  console.log('✅ Usuário criado!');
  return await response.json();
}

async function login() {
  console.log('🔐 Fazendo login...');
  
  const response = await fetch(`${API_BASE_URL}/auth/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: TEST_USER.email,
      senha: TEST_USER.senha
    }),
  });

  if (!response.ok) {
    throw new Error(`Login falhou: ${response.status}`);
  }

  const data = await response.json();
  console.log('✅ Login realizado!\n');
  return data.accessToken;
}

async function createReadlist(token, readlistData) {
  const response = await fetch(`${API_BASE_URL}/readlists`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(readlistData),
  });

  if (!response.ok) {
    throw new Error(`Erro ao criar readlist: ${response.status}`);
  }

  return await response.json();
}

function formatSlug(nome) {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 SETUP COMPLETO DE DADOS DE TESTE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // 1. Criar usuário
    await createUser();
    
    // 2. Fazer login
    const token = await login();
    
    // 3. Criar readlists
    console.log('📚 Criando readlists...\n');
    const created = [];
    
    for (const readlist of TEST_READLISTS) {
      try {
        const result = await createReadlist(token, readlist);
        created.push(result);
        console.log(`   ✅ ${readlist.nome} (${readlist.publica ? 'Pública' : 'Privada'})`);
      } catch (error) {
        console.log(`   ❌ ${readlist.nome} - ${error.message}`);
      }
    }

    // Resultado final
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ SETUP CONCLUÍDO COM SUCESSO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('📊 Resumo:');
    console.log(`   • Usuário: ${TEST_USER.username}`);
    console.log(`   • Readlists criadas: ${created.length}/${TEST_READLISTS.length}\n`);
    
    console.log('🔑 Credenciais:');
    console.log(`   • Email: ${TEST_USER.email}`);
    console.log(`   • Senha: ${TEST_USER.senha}\n`);
    
    console.log('🌐 URLs para testar:');
    console.log(`   • Login: http://localhost:3000/login`);
    
    if (created.length > 0) {
      console.log('\n📖 Suas readlists:');
      created.forEach(rl => {
        const slug = formatSlug(rl.nome);
        console.log(`   • http://localhost:3000/${TEST_USER.username}/readlist/${slug}`);
      });
    }
    
    console.log('\n💡 Próximos passos:');
    console.log('   1. Abra http://localhost:3000/login');
    console.log('   2. Faça login com as credenciais acima');
    console.log('   3. Teste as readlists criadas!');
    console.log('   4. Ou teste no modo mock: http://localhost:3000/gatanoturna/readlist/teste');
    console.log('\n');

  } catch (error) {
    console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ ERRO NO SETUP');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.error('Erro:', error.message);
    console.log('\n📝 Checklist:');
    console.log('   ☐ Backend está rodando? (http://localhost:3001)');
    console.log('   ☐ MongoDB está rodando?');
    console.log('   ☐ As portas 3000 e 3001 estão disponíveis?');
    console.log('\n💡 Tente:');
    console.log('   1. cd ../livraback && npm run start:dev');
    console.log('   2. Verifique os logs do backend');
    console.log('   3. Execute este script novamente\n');
    process.exit(1);
  }
}

main();
