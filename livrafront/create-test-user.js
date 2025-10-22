// Script para criar usuário de teste no banco de dados
// Execute: node create-test-user.js

const API_BASE_URL = 'http://localhost:3001';

// Dados do usuário de teste
const TEST_USER = {
  username: 'gatanoturna',
  email: 'teste@exemplo.com',
  senha: 'senha123'
};

async function createUser() {
  console.log('👤 Criando usuário de teste...');
  console.log(`   Username: ${TEST_USER.username}`);
  console.log(`   Email: ${TEST_USER.email}`);
  console.log(`   Senha: ${TEST_USER.senha}\n`);
  
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(TEST_USER),
  });

  if (!response.ok) {
    const error = await response.text();
    
    // Se usuário já existe, não é erro crítico
    if (response.status === 409 || error.includes('já existe')) {
      console.log('ℹ️  Usuário já existe no banco de dados');
      return { exists: true };
    }
    
    throw new Error(`Erro ao criar usuário: ${response.status} - ${error}`);
  }

  const data = await response.json();
  console.log('✅ Usuário criado com sucesso!');
  return data;
}

async function login() {
  console.log('\n🔐 Testando login...');
  
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
  console.log('✅ Login funcionando corretamente!');
  return data.accessToken;
}

async function main() {
  try {
    console.log('🚀 Iniciando setup de usuário de teste...\n');

    // 1. Criar usuário
    await createUser();

    // 2. Testar login
    const token = await login();

    console.log('\n✨ Setup concluído com sucesso!');
    console.log('\n📋 Credenciais de teste:');
    console.log(`   Email: ${TEST_USER.email}`);
    console.log(`   Senha: ${TEST_USER.senha}`);
    console.log(`   Username: ${TEST_USER.username}`);
    
    console.log('\n🔗 Próximos passos:');
    console.log('   1. Execute: node create-test-readlists.js');
    console.log('   2. Acesse: http://localhost:3000/login');
    console.log('   3. Faça login com as credenciais acima');
    console.log(`   4. Teste: http://localhost:3000/${TEST_USER.username}/readlist/teste\n`);

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    console.log('\n📝 Dicas:');
    console.log('   1. Verifique se o backend está rodando (http://localhost:3001)');
    console.log('   2. Verifique se o MongoDB está rodando');
    console.log('   3. Ajuste os dados do usuário no início do script se necessário');
    process.exit(1);
  }
}

main();
