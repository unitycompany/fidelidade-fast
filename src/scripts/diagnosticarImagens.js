import { supabase } from '../services/supabase';

/**
 * Script de diagnóstico para o sistema de imagens
 */
async function diagnosticarSistemaImagens() {
    console.log('🔍 Iniciando diagnóstico do sistema de imagens...\n');

    try {
        // 1. Verificar conexão com Supabase
        console.log('1️⃣ Testando conexão com Supabase...');
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
            console.error('❌ Erro de autenticação:', authError);
            return;
        }

        if (user) {
            console.log('✅ Usuário autenticado:', user.id);
        } else {
            console.log('⚠️ Usuário não autenticado');
        }

        // 2. Verificar se bucket existe
        console.log('\n2️⃣ Verificando buckets disponíveis...');
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

        if (bucketsError) {
            console.error('❌ Erro ao listar buckets:', bucketsError);
        } else {
            console.log('📁 Buckets encontrados:', buckets.map(b => b.name));

            const notasFiscaisBucket = buckets.find(b => b.name === 'notas-fiscais');
            if (notasFiscaisBucket) {
                console.log('✅ Bucket "notas-fiscais" encontrado:', notasFiscaisBucket);
            } else {
                console.log('❌ Bucket "notas-fiscais" NÃO encontrado!');
            }
        }

        // 3. Verificar tabela de imagens
        console.log('\n3️⃣ Verificando tabela imagens_notas_fiscais...');
        const { data: imagensTest, error: tabelaError } = await supabase
            .from('imagens_notas_fiscais')
            .select('*')
            .limit(1);

        if (tabelaError) {
            console.error('❌ Erro na tabela imagens_notas_fiscais:', tabelaError);
            console.log('💡 Execute o script SQL: sql/20_tabela_imagens_notas.sql');
        } else {
            console.log('✅ Tabela imagens_notas_fiscais existe');
            console.log(`📊 Registros encontrados: ${imagensTest?.length || 0}`);
        }

        // 4. Verificar tabela clientes_fast
        console.log('\n4️⃣ Verificando tabela clientes_fast...');
        const { data: clientesTest, error: clientesError } = await supabase
            .from('clientes_fast')
            .select('id, nome, role')
            .limit(3);

        if (clientesError) {
            console.error('❌ Erro na tabela clientes_fast:', clientesError);
        } else {
            console.log('✅ Tabela clientes_fast existe');
            console.log('👥 Clientes de teste:', clientesTest);
        }

        // 5. Testar políticas de storage
        console.log('\n5️⃣ Testando políticas de storage...');
        try {
            const { data: files, error: listError } = await supabase.storage
                .from('notas-fiscais')
                .list('', { limit: 1 });

            if (listError) {
                console.error('❌ Erro ao listar arquivos (pode ser política):', listError);
            } else {
                console.log('✅ Conseguiu listar arquivos no bucket');
                console.log(`📁 Arquivos encontrados: ${files?.length || 0}`);
            }
        } catch (error) {
            console.error('❌ Erro ao testar políticas:', error);
        }

        // 6. Testar upload de um arquivo pequeno
        console.log('\n6️⃣ Testando upload de arquivo de teste...');
        try {
            const testFile = new Blob(['teste'], { type: 'text/plain' });
            const testFileName = `teste-${Date.now()}.txt`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('notas-fiscais')
                .upload(`test/${testFileName}`, testFile);

            if (uploadError) {
                console.error('❌ Erro no upload de teste:', uploadError);
                console.log('💡 Verifique as políticas RLS do storage');
            } else {
                console.log('✅ Upload de teste bem-sucedido:', uploadData);

                // Limpar arquivo de teste
                await supabase.storage
                    .from('notas-fiscais')
                    .remove([`test/${testFileName}`]);
                console.log('🗑️ Arquivo de teste removido');
            }
        } catch (error) {
            console.error('❌ Erro no teste de upload:', error);
        }

        console.log('\n🎯 Diagnóstico completo!');

    } catch (error) {
        console.error('❌ Erro geral no diagnóstico:', error);
    }
}

// Exportar função para uso
export default diagnosticarSistemaImagens;

// Auto-executar se chamado diretamente
if (typeof window !== 'undefined') {
    // Executar no navegador
    diagnosticarSistemaImagens();
}
