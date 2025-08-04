import { supabase } from '../services/supabase';

/**
 * Teste direto sem depender de listBuckets()
 */
export default async function testeDirecto() {
    console.log('🎯 Teste direto do bucket notas-fiscais...');

    try {
        // 1. Verificar autenticação
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            console.error('❌ Usuário não autenticado:', userError);
            return { success: false, error: 'Não autenticado' };
        }

        console.log('✅ Usuário autenticado:', user.email);

        // 2. Testar acesso direto ao bucket (sem listar)
        console.log('🧪 Testando acesso direto ao bucket...');

        const { data: files, error: listError } = await supabase
            .storage
            .from('notas-fiscais')
            .list('', { limit: 1 });

        if (listError) {
            console.error('❌ Erro ao acessar bucket:', listError);

            if (listError.message.includes('not found')) {
                return {
                    success: false,
                    error: 'BUCKET_NOT_FOUND',
                    message: 'Bucket não existe. Crie manualmente no painel do Supabase.'
                };
            }

            if (listError.message.includes('permission') || listError.message.includes('policy')) {
                return {
                    success: false,
                    error: 'PERMISSION_DENIED',
                    message: 'Faltam políticas RLS. Execute o script SQL de políticas.'
                };
            }

            return {
                success: false,
                error: listError.code,
                message: listError.message
            };
        }

        console.log('✅ Conseguiu acessar o bucket!');
        console.log('📁 Arquivos encontrados:', files?.length || 0);

        // 3. Testar upload direto
        console.log('🚀 Testando upload direto...');

        const testContent = `Teste direto - ${new Date().toISOString()}`;
        const testFile = new File([testContent], 'teste-direto.txt', { type: 'text/plain' });
        const testPath = `${user.id}/teste-direto-${Date.now()}.txt`;

        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('notas-fiscais')
            .upload(testPath, testFile);

        if (uploadError) {
            console.error('❌ Erro no upload direto:', uploadError);
            return {
                success: false,
                error: uploadError.code,
                message: `Upload falhou: ${uploadError.message}`
            };
        }

        console.log('✅ Upload direto bem-sucedido!');
        console.log('📄 Dados:', uploadData);

        // 4. Testar URL pública
        const { data: urlData } = supabase
            .storage
            .from('notas-fiscais')
            .getPublicUrl(testPath);

        console.log('🔗 URL pública:', urlData.publicUrl);

        // 5. Limpar arquivo de teste
        const { error: deleteError } = await supabase
            .storage
            .from('notas-fiscais')
            .remove([testPath]);

        if (deleteError) {
            console.warn('⚠️ Não conseguiu remover arquivo de teste:', deleteError.message);
        } else {
            console.log('🧹 Arquivo de teste removido');
        }

        return {
            success: true,
            message: '🎉 Bucket funcionando perfeitamente!',
            data: {
                canAccess: true,
                canUpload: true,
                canDelete: !deleteError,
                publicUrl: urlData.publicUrl.replace(testPath, '')
            }
        };

    } catch (error) {
        console.error('💥 Erro inesperado no teste direto:', error);
        return {
            success: false,
            error: 'UNEXPECTED_ERROR',
            message: error.message
        };
    }
}

// Disponibilizar no console
window.testeDirecto = testeDirecto;
