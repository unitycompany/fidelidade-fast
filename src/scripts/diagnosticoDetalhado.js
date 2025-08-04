import { supabase } from '../services/supabase';

/**
 * Diagnóstico detalhado para identificar problemas com o bucket
 */
export default async function diagnosticoDetalhado() {
    console.log('🔍 Iniciando diagnóstico detalhado...');

    try {
        // 1. Verificar conexão e autenticação
        console.log('\n1️⃣ Verificando conexão e autenticação...');
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
            console.error('❌ Erro de autenticação:', userError);
            return;
        }

        if (!user) {
            console.error('❌ Usuário não autenticado');
            return;
        }

        console.log('✅ Usuário autenticado:', {
            id: user.id,
            email: user.email,
            role: user.role
        });

        // 2. Verificar configuração do Supabase
        console.log('\n2️⃣ Verificando configuração do Supabase...');
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        console.log('🔧 URL do Supabase:', supabaseUrl);
        console.log('🔑 Chave (primeiros 20 chars):', supabaseKey?.substring(0, 20) + '...');

        // 3. Listar ALL buckets com detalhes
        console.log('\n3️⃣ Listando TODOS os buckets...');
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

        if (bucketsError) {
            console.error('❌ Erro ao listar buckets:', bucketsError);
            console.log('📋 Detalhes do erro:', {
                message: bucketsError.message,
                details: bucketsError.details,
                hint: bucketsError.hint,
                code: bucketsError.code
            });
            return;
        }

        console.log('📁 Total de buckets encontrados:', buckets.length);
        buckets.forEach((bucket, index) => {
            console.log(`📦 Bucket ${index + 1}:`, {
                id: bucket.id,
                name: bucket.name,
                public: bucket.public,
                file_size_limit: bucket.file_size_limit,
                allowed_mime_types: bucket.allowed_mime_types,
                created_at: bucket.created_at,
                updated_at: bucket.updated_at
            });
        });

        // 4. Verificar especificamente o bucket notas-fiscais
        console.log('\n4️⃣ Procurando bucket "notas-fiscais"...');
        const notasFiscaisBucket = buckets.find(b => b.name === 'notas-fiscais');

        if (!notasFiscaisBucket) {
            console.error('❌ Bucket "notas-fiscais" NÃO encontrado na lista!');

            // Verificar se tem algum bucket com nome similar
            const similarBuckets = buckets.filter(b =>
                b.name.includes('nota') ||
                b.name.includes('fiscal') ||
                b.name.includes('notas')
            );

            if (similarBuckets.length > 0) {
                console.log('🔍 Buckets com nomes similares encontrados:');
                similarBuckets.forEach(bucket => {
                    console.log(`   📦 "${bucket.name}"`);
                });
            }

            return;
        }

        console.log('✅ Bucket "notas-fiscais" encontrado!');
        console.log('📊 Detalhes completos:', notasFiscaisBucket);

        // 5. Testar acesso ao bucket
        console.log('\n5️⃣ Testando acesso ao bucket...');

        try {
            const { data: files, error: listError } = await supabase
                .storage
                .from('notas-fiscais')
                .list('', { limit: 5 });

            if (listError) {
                console.error('❌ Erro ao acessar bucket:', listError);
                console.log('📋 Detalhes do erro de acesso:', {
                    message: listError.message,
                    details: listError.details,
                    hint: listError.hint,
                    code: listError.code
                });

                // Verificar se é erro de permissão
                if (listError.message.includes('permission') || listError.message.includes('policy')) {
                    console.log('🚨 PROBLEMA: Falta de permissão!');
                    console.log('💡 SOLUÇÃO: Configure as políticas RLS do storage');
                    return;
                }

                return;
            }

            console.log('✅ Conseguiu acessar o bucket!');
            console.log('📁 Arquivos encontrados:', files?.length || 0);

            if (files && files.length > 0) {
                files.forEach((file, index) => {
                    console.log(`   📄 Arquivo ${index + 1}: ${file.name}`);
                });
            }

        } catch (accessError) {
            console.error('💥 Erro ao tentar acessar bucket:', accessError);
        }

        // 6. Testar upload simples
        console.log('\n6️⃣ Testando upload simples...');

        try {
            const testContent = `Teste de diagnóstico - ${new Date().toISOString()}`;
            const testFile = new File([testContent], 'diagnostico-teste.txt', { type: 'text/plain' });
            const testPath = `diagnostico/teste-${Date.now()}.txt`;

            const { data: uploadData, error: uploadError } = await supabase
                .storage
                .from('notas-fiscais')
                .upload(testPath, testFile);

            if (uploadError) {
                console.error('❌ Erro no upload de teste:', uploadError);
                console.log('📋 Detalhes do erro de upload:', {
                    message: uploadError.message,
                    details: uploadError.details,
                    hint: uploadError.hint,
                    code: uploadError.code
                });

                // Análise específica de erros
                if (uploadError.message.includes('policy')) {
                    console.log('🚨 PROBLEMA: Políticas RLS não configuradas!');
                    console.log('💡 SOLUÇÃO: Execute as políticas SQL do arquivo SISTEMA_IMAGENS_NOTAS.md');
                } else if (uploadError.message.includes('not found')) {
                    console.log('🚨 PROBLEMA: Bucket não encontrado pelo upload!');
                    console.log('💡 POSSÍVEL CAUSA: Cache do navegador ou problema de sincronia');
                }

                return;
            }

            console.log('✅ Upload de teste bem-sucedido!');
            console.log('📄 Dados do upload:', uploadData);

            // Limpar arquivo de teste
            const { error: deleteError } = await supabase
                .storage
                .from('notas-fiscais')
                .remove([testPath]);

            if (deleteError) {
                console.warn('⚠️ Não conseguiu remover arquivo de teste:', deleteError.message);
            } else {
                console.log('🧹 Arquivo de teste removido com sucesso');
            }

        } catch (uploadError) {
            console.error('💥 Erro inesperado no teste de upload:', uploadError);
        }

        // 7. Verificar políticas RLS
        console.log('\n7️⃣ Verificando políticas RLS...');

        try {
            const { data: policies, error: policiesError } = await supabase
                .rpc('get_storage_policies');

            if (policiesError) {
                console.log('⚠️ Não conseguiu verificar políticas automaticamente:', policiesError.message);
                console.log('💡 Verifique manualmente em Storage > Policies no painel do Supabase');
            } else {
                console.log('📋 Políticas encontradas:', policies?.length || 'nenhuma');
            }

        } catch (policyError) {
            console.log('⚠️ Verificação de políticas não disponível nesta versão');
        }

        console.log('\n🎯 DIAGNÓSTICO COMPLETO!');
        console.log('📊 Resumo:');
        console.log(`   ✅ Autenticado: ${user ? 'SIM' : 'NÃO'}`);
        console.log(`   ✅ Buckets listados: ${buckets.length}`);
        console.log(`   ✅ Bucket "notas-fiscais": ${notasFiscaisBucket ? 'ENCONTRADO' : 'NÃO ENCONTRADO'}`);

    } catch (error) {
        console.error('💥 Erro geral no diagnóstico:', error);
        console.log('📋 Stack trace:', error.stack);
    }
}

// Disponibilizar no console
window.diagnosticoDetalhado = diagnosticoDetalhado;
