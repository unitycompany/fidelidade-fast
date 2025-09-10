console.log('🔍 Testando função de crédito de pontos...');

// Simular um usuário de teste
const userTest = {
    id: 'test-user-123',
    nome: 'Usuário Teste',
    cpf_cnpj: '12345678901',
    saldo_pontos: 100
};

// Função de teste
async function testarCreditoPontos() {
    try {
        console.log('1. Simulando dados de entrada para addPointsToCustomer...');

        const customerId = userTest.id;
        const pontosParaAdicionar = 50;
        const descricao = 'Teste de crédito de pontos';

        console.log('Dados de entrada:', {
            customerId,
            pontosParaAdicionar,
            descricao
        });

        console.log('2. Verificando se a função está sendo chamada corretamente...');

        // Aqui simularemos o processo que acontece no UploadPedidoNovo.jsx

        console.log('3. Verificando se existe problema na estrutura de dados...');

        // Verificar estrutura do usuário retornado do login
        console.log('Estrutura do usuário logado:', userTest);

        // Verificar se o ID está presente
        if (!userTest.id) {
            console.error('❌ PROBLEMA ENCONTRADO: user.id está undefined ou null!');
            return;
        }

        console.log('✅ user.id está presente:', userTest.id);

        console.log('4. Verificando console logs do fluxo real...');
        console.log('Procure por logs que começam com [SUPABASE] no console do navegador');

    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

testarCreditoPontos();
