/**
 * Script de test pour le chat avec recherche TMDB
 */

require('dotenv').config();
const axios = require('axios');

const API_URL = 'http://localhost:10000/api/chat';

// Messages de test
const testMessages = [
    "Oi! Me fale sobre o filme Avatar",
    "O que você sabe sobre John Wick?",
    "Me recomende um filme de ação",
    "Qual é a sinopse de Interestelar?",
    "Me fale sobre o filme Duna de 2021",
    "Quero saber sobre Matrix"
];

async function testChat(message) {
    console.log('\n' + '='.repeat(80));
    console.log('👤 USUÁRIO:', message);
    console.log('='.repeat(80));
    
    try {
        const response = await axios.post(API_URL, 
            { message },
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );
        
        console.log('🤖 ASSISTENTE:', response.data.response);
        console.log('✅ Status:', response.status);
        return true;
    } catch (error) {
        console.error('❌ ERRO:', error.response?.data || error.message);
        return false;
    }
}

async function runTests() {
    console.log('\n🎬 === TESTE DO CHAT CINEHOME COM TMDB ===\n');
    console.log('📍 API URL:', API_URL);
    console.log('🔑 TMDB API Key:', process.env.TMDB_API_KEY ? '✅ Configurada' : '❌ NÃO configurada');
    console.log('🔑 GROQ API Key:', process.env.GROQ_API_KEY ? '✅ Configurada' : '❌ NÃO configurada');
    
    if (!process.env.TMDB_API_KEY || !process.env.GROQ_API_KEY) {
        console.error('\n❌ ERRO: Configure as chaves API no arquivo .env');
        process.exit(1);
    }
    
    console.log('\n⏳ Aguarde 3 segundos para o servidor iniciar...\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    let successCount = 0;
    
    for (const message of testMessages) {
        const success = await testChat(message);
        if (success) successCount++;
        
        // Aguardar entre requisições para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('\n' + '='.repeat(80));
    console.log(`✅ Testes concluídos: ${successCount}/${testMessages.length} bem-sucedidos`);
    console.log('='.repeat(80) + '\n');
}

// Executar testes
runTests().catch(error => {
    console.error('❌ Erro ao executar testes:', error);
    process.exit(1);
});
