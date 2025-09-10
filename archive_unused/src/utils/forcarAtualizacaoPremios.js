// Script para FORÇAR atualização dos prêmios conforme tabela exata do cliente
// Execute este arquivo uma vez para limpar e inserir os prêmios corretos

import { supabase } from '../services/supabase.js';

// PRÊMIOS EXATOS CONFORME TABELA DO CLIENTE
const PREMIOS_EXATOS = [
    {
        nome: 'Nível Laser',
        descricao: 'Nível laser profissional',
        categoria: 'ferramentas',
        pontos_necessarios: 10000,
        valor_estimado: 500.00,
        estoque_disponivel: 5,
        estoque_ilimitado: false,
        ativo: true,
        destaque: true,
        ordem_exibicao: 1
    },
    {
        nome: 'Parafusadeira',
        descricao: 'Parafusadeira elétrica profissional',
        categoria: 'ferramentas',
        pontos_necessarios: 5000,
        valor_estimado: 300.00,
        estoque_disponivel: 8,
        estoque_ilimitado: false,
        ativo: true,
        destaque: true,
        ordem_exibicao: 2
    },
    {
        nome: 'Trena Digital',
        descricao: 'Trena digital de precisão',
        categoria: 'ferramentas',
        pontos_necessarios: 3000,
        valor_estimado: 200.00,
        estoque_disponivel: 10,
        estoque_ilimitado: false,
        ativo: true,
        destaque: true,
        ordem_exibicao: 3
    },
    {
        nome: 'Kit Brocas SDS (5 unid.)',
        descricao: 'Kit com 5 brocas SDS profissionais',
        categoria: 'ferramentas',
        pontos_necessarios: 1500,
        valor_estimado: 80.00,
        estoque_disponivel: 15,
        estoque_ilimitado: false,
        ativo: true,
        destaque: false,
        ordem_exibicao: 4
    },
    {
        nome: 'Vale-compras em produtos Fast',
        descricao: 'Vale para compra de produtos Fast Sistemas',
        categoria: 'vale_compras',
        pontos_necessarios: 2000,
        valor_estimado: 100.00,
        estoque_disponivel: 0,
        estoque_ilimitado: true,
        ativo: true,
        destaque: true,
        ordem_exibicao: 5
    },
    {
        nome: 'Camiseta personalizada Fast',
        descricao: 'Camiseta personalizada com logo Fast Sistemas',
        categoria: 'brindes',
        pontos_necessarios: 1000,
        valor_estimado: 50.00,
        estoque_disponivel: 50,
        estoque_ilimitado: false,
        ativo: true,
        destaque: false,
        ordem_exibicao: 6
    },
    {
        nome: 'Boné Fast',
        descricao: 'Boné com logo Fast Sistemas',
        categoria: 'brindes',
        pontos_necessarios: 800,
        valor_estimado: 40.00,
        estoque_disponivel: 60,
        estoque_ilimitado: false,
        ativo: true,
        destaque: false,
        ordem_exibicao: 7
    }
];

export async function forcarAtualizacaoPremios() {
    try {
        console.log('🔄 FORÇANDO ATUALIZAÇÃO DOS PRÊMIOS...');

        // 1. LIMPAR TODOS OS PRÊMIOS EXISTENTES
        console.log('🗑️ Limpando prêmios existentes...');
        const { error: deleteError } = await supabase
            .from('premios_catalogo')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Deletar todos

        if (deleteError) {
            console.error('Erro ao limpar prêmios:', deleteError);
        } else {
            console.log('✅ Prêmios existentes removidos');
        }

        // 2. INSERIR APENAS OS PRÊMIOS CORRETOS
        console.log('📝 Inserindo prêmios corretos...');
        const { data, error } = await supabase
            .from('premios_catalogo')
            .insert(PREMIOS_EXATOS)
            .select();

        if (error) {
            console.error('❌ Erro ao inserir prêmios:', error);
            return { success: false, error: error.message };
        }

        console.log(`✅ ${data.length} prêmios inseridos com sucesso!`);

        // 3. VERIFICAR RESULTADO
        const { data: verificacao, error: verifyError } = await supabase
            .from('premios_catalogo')
            .select('nome, categoria, pontos_necessarios, valor_estimado')
            .order('ordem_exibicao');

        if (verifyError) {
            console.error('Erro na verificação:', verifyError);
        } else {
            console.log('📋 PRÊMIOS ATUAIS NO BANCO:');
            verificacao.forEach(p => {
                console.log(`   • ${p.nome} - ${p.categoria} - ${p.pontos_necessarios} pts - R$ ${p.valor_estimado}`);
            });
        }

        return { success: true, data, message: `${data.length} prêmios atualizados` };

    } catch (error) {
        console.error('❌ Erro na atualização forçada:', error);
        return { success: false, error: error.message };
    }
}

// Para executar manualmente no console:
// forcarAtualizacaoPremios().then(result => console.log('Resultado:', result));

export default forcarAtualizacaoPremios;
