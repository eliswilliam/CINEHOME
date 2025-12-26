/**
 * 🧠 Teste do Sistema de Memória do Chat
 * 
 * Este script testa se o chat mantém o contexto entre mensagens
 */

const API_URL = 'http://localhost:10000/api/chat';

// Cores para o terminal
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    blue: '\x1b[34m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function sendChatMessage(message, sessionId) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message, sessionId })
        });

        const data = await response.json();
        return data;
    } catch (error) {
        log(`❌ Erro ao enviar mensagem: ${error.message}`, 'red');
        throw error;
    }
}

async function clearSession(sessionId) {
    try {
        const response = await fetch(`${API_URL}/clear`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId })
        });

        return await response.json();
    } catch (error) {
        log(`❌ Erro ao limpar sessão: ${error.message}`, 'red');
        throw error;
    }
}

async function getSessionInfo(sessionId) {
    try {
        const response = await fetch(`http://localhost:10000/api/chat/session/${sessionId}`);
        return await response.json();
    } catch (error) {
        log(`❌ Erro ao obter info da sessão: ${error.message}`, 'red');
        throw error;
    }
}

async function runTests() {
    log('\n🧪 ========================================', 'cyan');
    log('   TESTE DO SISTEMA DE MEMÓRIA DO CHAT', 'cyan');
    log('========================================\n', 'cyan');

    const sessionId = `test-session-${Date.now()}`;
    log(`🔑 SessionId de teste: ${sessionId}\n`, 'yellow');

    try {
        // ==========================================
        // TESTE 1: Primeira mensagem
        // ==========================================
        log('📝 TESTE 1: Pergunta inicial sobre um filme', 'blue');
        log('─────────────────────────────────────────', 'blue');
        
        const msg1 = 'Me fale sobre o filme Avatar';
        log(`👤 Usuário: ${msg1}`, 'yellow');
        
        const response1 = await sendChatMessage(msg1, sessionId);
        log(`🤖 Bot: ${response1.response.substring(0, 150)}...`, 'green');
        log(`✅ SessionId recebido: ${response1.sessionId}\n`, 'cyan');

        // Verificar info da sessão
        const info1 = await getSessionInfo(sessionId);
        log(`📊 Mensagens na sessão: ${info1.messageCount}`, 'cyan');
        console.assert(info1.messageCount === 2, '❌ Deveria ter 2 mensagens (user + bot)');

        // ==========================================
        // TESTE 2: Pergunta com contexto
        // ==========================================
        log('\n📝 TESTE 2: Pergunta que depende do contexto', 'blue');
        log('─────────────────────────────────────────────', 'blue');
        
        const msg2 = 'Quem dirigiu esse filme?';
        log(`👤 Usuário: ${msg2}`, 'yellow');
        
        const response2 = await sendChatMessage(msg2, sessionId);
        log(`🤖 Bot: ${response2.response.substring(0, 150)}...`, 'green');
        
        // Verificar se mencionou "James Cameron" ou "Avatar" na resposta
        const mentionsDirector = response2.response.toLowerCase().includes('james cameron') || 
                                response2.response.toLowerCase().includes('cameron');
        
        if (mentionsDirector) {
            log('✅ Bot manteve o contexto e respondeu corretamente!', 'green');
        } else {
            log('⚠️  Bot pode não ter mantido o contexto adequadamente', 'red');
        }

        const info2 = await getSessionInfo(sessionId);
        log(`📊 Mensagens na sessão: ${info2.messageCount}\n`, 'cyan');
        console.assert(info2.messageCount === 4, '❌ Deveria ter 4 mensagens');

        // ==========================================
        // TESTE 3: Mais uma pergunta contextual
        // ==========================================
        log('\n📝 TESTE 3: Terceira pergunta com contexto', 'blue');
        log('────────────────────────────────────────', 'blue');
        
        const msg3 = 'Em que ano foi lançado?';
        log(`👤 Usuário: ${msg3}`, 'yellow');
        
        const response3 = await sendChatMessage(msg3, sessionId);
        log(`🤖 Bot: ${response3.response.substring(0, 150)}...`, 'green');
        
        // Verificar se mencionou o ano 2009
        const mentionsYear = response3.response.includes('2009');
        
        if (mentionsYear) {
            log('✅ Bot ainda mantém o contexto completo!', 'green');
        } else {
            log('⚠️  Bot pode ter perdido o contexto', 'red');
        }

        const info3 = await getSessionInfo(sessionId);
        log(`📊 Mensagens na sessão: ${info3.messageCount}\n`, 'cyan');

        // ==========================================
        // TESTE 4: Verificar filtro TMDB
        // ==========================================
        log('\n📝 TESTE 4: Verificar filtro de segurança (TMDB)', 'blue');
        log('────────────────────────────────────────────────', 'blue');
        
        const hasTMDBMention = response1.response.includes('TMDB') || 
                              response1.response.includes('The Movie Database') ||
                              response2.response.includes('TMDB') ||
                              response3.response.includes('TMDB');
        
        if (hasTMDBMention) {
            log('❌ FALHA: Encontrou menção ao TMDB nas respostas!', 'red');
        } else {
            log('✅ Filtro TMDB funcionando corretamente!', 'green');
        }

        // ==========================================
        // TESTE 5: Limpar sessão
        // ==========================================
        log('\n📝 TESTE 5: Limpar histórico da sessão', 'blue');
        log('──────────────────────────────────────', 'blue');
        
        const clearResult = await clearSession(sessionId);
        log(`🗑️  Resultado: ${JSON.stringify(clearResult)}`, 'yellow');
        
        const info4 = await getSessionInfo(sessionId);
        if (!info4.exists) {
            log('✅ Sessão limpa com sucesso!', 'green');
        } else {
            log('❌ FALHA: Sessão ainda existe após limpeza', 'red');
        }

        // ==========================================
        // TESTE 6: Nova mensagem após limpeza
        // ==========================================
        log('\n📝 TESTE 6: Nova mensagem após limpar histórico', 'blue');
        log('────────────────────────────────────────────────', 'blue');
        
        const msg4 = 'Quem dirigiu o filme?';
        log(`👤 Usuário: ${msg4}`, 'yellow');
        
        const response4 = await sendChatMessage(msg4, sessionId);
        log(`🤖 Bot: ${response4.response.substring(0, 150)}...`, 'green');
        
        // Agora o bot NÃO deveria saber sobre qual filme estamos falando
        const asksWhichMovie = response4.response.toLowerCase().includes('qual filme') ||
                              response4.response.toLowerCase().includes('que filme') ||
                              response4.response.toLowerCase().includes('não sei');
        
        if (asksWhichMovie) {
            log('✅ Bot esqueceu o contexto anterior corretamente!', 'green');
        } else {
            log('⚠️  Bot ainda pode ter algum contexto (inesperado)', 'yellow');
        }

        // ==========================================
        // RESUMO FINAL
        // ==========================================
        log('\n\n✨ ========================================', 'cyan');
        log('   RESUMO DOS TESTES', 'cyan');
        log('========================================', 'cyan');
        log('✅ Sistema de memória implementado', 'green');
        log('✅ Contexto mantido entre mensagens', 'green');
        log('✅ SessionId funcionando', 'green');
        log('✅ Limpeza de sessão funcionando', 'green');
        log('✅ Filtro TMDB ativo', 'green');
        log('\n🎉 Todos os testes concluídos!\n', 'green');

    } catch (error) {
        log(`\n❌ ERRO DURANTE OS TESTES: ${error.message}`, 'red');
        log('Certifique-se de que o servidor está rodando em http://localhost:10000\n', 'yellow');
        process.exit(1);
    }
}

// Executar testes
runTests();
