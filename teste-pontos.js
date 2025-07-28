// Teste rápido para verificar se os pontos estão sendo salvos e recuperados corretamente

import { supabase } from '../src/services/supabase.js';

const testarSistemaPontos = async () => {
    const userId = '68e25e77-ed0d-421d-bb9b-fa115ecf1de4'; // ID do usuário do console

    try {
        console.log('🧪 Iniciando teste do sistema de pontos...');

        // 1. Verificar dados atuais do usuário
        console.log('📊 1. Verificando dados atuais...');
        const { data: dadosAtuais, error: erro1 } = await supabase
            .from('clientes_fast')
            .select('saldo_pontos, total_pontos_ganhos, total_pontos_gastos')
            .eq('id', userId)
            .single();

        if (erro1) {
            console.error('❌ Erro ao buscar dados:', erro1);
            return;
        }

        console.log('📈 Dados atuais:', dadosAtuais);

        // 2. Verificar histórico de pontos
        console.log('📋 2. Verificando histórico...');
        const { data: historico, error: erro2 } = await supabase
            .from('historico_pontos')
            .select('*')
            .eq('cliente_id', userId)
            .order('created_at', { ascending: false })
            .limit(5);

        if (erro2) {
            console.error('❌ Erro ao buscar histórico:', erro2);
        } else {
            console.log('📜 Últimos 5 registros do histórico:', historico);
        }

        // 3. Verificar se há dados nulos
        const pontosSaldo = dadosAtuais.saldo_pontos;
        const pontosGanhos = dadosAtuais.total_pontos_ganhos;
        const pontosGastos = dadosAtuais.total_pontos_gastos;

        console.log('🔍 3. Verificação de valores nulos:');
        console.log('   - saldo_pontos:', pontosSaldo, '(null?', pontosSaldo === null, ')');
        console.log('   - total_pontos_ganhos:', pontosGanhos, '(null?', pontosGanhos === null, ')');
        console.log('   - total_pontos_gastos:', pontosGastos, '(null?', pontosGastos === null, ')');

        if (pontosSaldo === null || pontosGanhos === null || pontosGastos === null) {
            console.log('⚠️ ATENÇÃO: Valores nulos encontrados!');

            // Corrigir valores nulos
            console.log('🔧 Corrigindo valores nulos...');
            const { error: erroCorrecao } = await supabase
                .from('clientes_fast')
                .update({
                    saldo_pontos: pontosSaldo || 0,
                    total_pontos_ganhos: pontosGanhos || 0,
                    total_pontos_gastos: pontosGastos || 0
                })
                .eq('id', userId);

            if (erroCorrecao) {
                console.error('❌ Erro ao corrigir valores:', erroCorrecao);
            } else {
                console.log('✅ Valores corrigidos com sucesso!');
            }
        } else {
            console.log('✅ Todos os valores estão OK (não nulos)');
        }

        console.log('🎉 Teste concluído!');

    } catch (error) {
        console.error('💥 Erro geral no teste:', error);
    }
};

export default testarSistemaPontos;
