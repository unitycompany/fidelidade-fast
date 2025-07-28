// Teste rápido para adicionar pontos manualmente
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://yduuvddkacvgduqvfspt.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkdXV2ZGRrYWN2Z2R1cXZmc3B0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NTQ0MDcsImV4cCI6MjA1MTIzMDQwN30.qJeRUvhfwejQC8cGJCLM-ZRUXhqNuJ8I8KLGWmRFCFY'
);

async function testAddPoints() {
    const userId = '68e25e77-ed0d-421d-bb9b-fa115ecf1de4';
    const points = 100;

    try {
        console.log('🧪 Teste: Buscando dados atuais do usuário...');

        // Buscar dados atuais
        const { data: currentUser, error: fetchError } = await supabase
            .from('clientes_fast')
            .select('saldo_pontos, total_pontos_ganhos')
            .eq('id', userId)
            .single();

        if (fetchError) {
            console.error('❌ Erro ao buscar usuário:', fetchError);
            return;
        }

        console.log('👤 Dados atuais:', currentUser);

        const newBalance = (currentUser.saldo_pontos || 0) + points;
        const newTotal = (currentUser.total_pontos_ganhos || 0) + points;

        console.log('📊 Novos valores:', { newBalance, newTotal });

        // Atualizar pontos
        const { error: updateError } = await supabase
            .from('clientes_fast')
            .update({
                saldo_pontos: newBalance,
                total_pontos_ganhos: newTotal
            })
            .eq('id', userId);

        if (updateError) {
            console.error('❌ Erro ao atualizar:', updateError);
            return;
        }

        console.log('✅ Pontos atualizados com sucesso!');

        // Verificar resultado
        const { data: updatedUser, error: verifyError } = await supabase
            .from('clientes_fast')
            .select('saldo_pontos, total_pontos_ganhos')
            .eq('id', userId)
            .single();

        console.log('🎯 Dados finais:', updatedUser);

    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

testAddPoints();
