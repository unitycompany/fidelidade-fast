import { supabase } from '../services/supabase';

/**
 * Script para verificar e configurar o bucket de notas fiscais
 */
export default async function criarBucketNotasFiscais() {
    console.log('🚀 Verificando bucket notas-fiscais...');

    try {
        // 1. Primeiro, verificar se o bucket já existe
        console.log('� Verificando buckets existentes...');
        const { data: buckets, error: listError } = await supabase
            .storage
            .listBuckets();

        if (listError) {
            console.error('❌ Erro ao listar buckets:', listError);
            return {
                success: false,
                error: listError,
                message: 'Não foi possível listar buckets. Verifique suas permissões de administrador no Supabase.'
            };
        }

        console.log('📁 Buckets encontrados:', buckets.map(b => b.name));

        const bucketExiste = buckets.find(b => b.name === 'notas-fiscais');

        if (bucketExiste) {
            console.log('✅ Bucket "notas-fiscais" já existe!');
            console.log('📊 Informações do bucket:', {
                name: bucketExiste.name,
                public: bucketExiste.public,
                created_at: bucketExiste.created_at
            });

            // Testar se consegue fazer upload
            return await testarUploadBucket();
        }

        // 2. Tentar criar o bucket (isso pode falhar por permissões)
        console.log('� Tentando criar bucket...');
        const { data: bucket, error: bucketError } = await supabase
            .storage
            .createBucket('notas-fiscais', {
                public: true,
                allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
                fileSizeLimit: 10485760 // 10MB
            });

        if (bucketError) {
            console.error('❌ Erro ao criar bucket:', bucketError);

            // Sugerir criação manual
            return {
                success: false,
                error: bucketError,
                message: `
❌ Não foi possível criar o bucket automaticamente.

🛠️ SOLUÇÃO: Criar manualmente no painel do Supabase

1. Acesse: https://supabase.com/dashboard/project/[SEU-PROJECT-ID]/storage/buckets
2. Clique em "New bucket"
3. Nome: notas-fiscais
4. Marque como "Public bucket"
5. Clique em "Create bucket"

Depois execute este teste novamente.
        `
            };
        }

        console.log('✅ Bucket criado com sucesso!');
        return await testarUploadBucket();

    } catch (error) {
        console.error('💥 Erro inesperado:', error);
        return {
            success: false,
            error,
            message: 'Erro inesperado. Verifique o console para mais detalhes.'
        };
    }
}

/**
 * Testa se consegue fazer upload no bucket
 */
async function testarUploadBucket() {
    try {
        console.log('🧪 Testando upload no bucket...');

        // Criar um arquivo de teste pequeno
        const testContent = `Teste de upload - ${new Date().toISOString()}`;
        const testFile = new File([testContent], 'teste-upload.txt', { type: 'text/plain' });
        const testPath = `teste/upload-${Date.now()}.txt`;

        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('notas-fiscais')
            .upload(testPath, testFile);

        if (uploadError) {
            console.error('❌ Erro no teste de upload:', uploadError);

            if (uploadError.message.includes('not found')) {
                return {
                    success: false,
                    error: uploadError,
                    message: `
❌ Bucket não encontrado!

🛠️ SOLUÇÃO: Criar o bucket manualmente no Supabase:
1. Acesse o painel do Supabase
2. Vá em Storage > Buckets  
3. Clique em "New bucket"
4. Nome: notas-fiscais
5. Marque "Public bucket"
6. Salve
          `
                };
            }

            if (uploadError.message.includes('policy')) {
                return {
                    success: false,
                    error: uploadError,
                    message: `
❌ Erro de permissão!

🛠️ SOLUÇÃO: Configurar políticas RLS no Storage:
1. Acesse Storage > Policies no Supabase
2. Execute as políticas SQL que estão no arquivo SISTEMA_IMAGENS_NOTAS.md
3. Teste novamente
          `
                };
            }

            return {
                success: false,
                error: uploadError,
                message: `Erro no upload: ${uploadError.message}`
            };
        }

        console.log('✅ Teste de upload bem-sucedido!');
        console.log('📄 Dados do upload:', uploadData);

        // Limpar arquivo de teste
        const { error: deleteError } = await supabase
            .storage
            .from('notas-fiscais')
            .remove([testPath]);

        if (deleteError) {
            console.warn('⚠️ Não foi possível remover arquivo de teste:', deleteError);
        } else {
            console.log('🧹 Arquivo de teste removido');
        }

        // Verificar URL pública
        const { data: urlData } = supabase
            .storage
            .from('notas-fiscais')
            .getPublicUrl('teste/exemplo.jpg');

        console.log('🔗 URL base para imagens:', urlData.publicUrl.replace('/teste/exemplo.jpg', ''));

        return {
            success: true,
            message: `
🎉 Bucket configurado e funcionando!

✅ Upload: OK
✅ Download: OK  
✅ URLs públicas: OK

O sistema de imagens está pronto para uso!
      `
        };

    } catch (error) {
        console.error('💥 Erro no teste:', error);
        return {
            success: false,
            error,
            message: `Erro no teste: ${error.message}`
        };
    }
}

// Permitir execução direta no console
window.criarBucketNotasFiscais = criarBucketNotasFiscais;
