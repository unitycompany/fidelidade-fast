import { supabase } from '../services/supabase';

/**
 * Script para configurar o storage do Supabase para imagens de notas fiscais
 * Execute este script uma vez para configurar o bucket e as policies
 */
async function configurarSupabaseStorage() {
    try {
        console.log('🔧 Configurando Supabase Storage...');

        // 1. Criar bucket se não existir
        const bucketName = 'notas-fiscais';

        const { data: buckets } = await supabase.storage.listBuckets();
        const bucketExists = buckets?.some(bucket => bucket.name === bucketName);

        if (!bucketExists) {
            console.log('📁 Criando bucket...');
            const { data, error } = await supabase.storage.createBucket(bucketName, {
                public: true,
                allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
                fileSizeLimit: 10485760 // 10MB
            });

            if (error) {
                console.error('❌ Erro ao criar bucket:', error);
                return false;
            }

            console.log('✅ Bucket criado:', data);
        } else {
            console.log('📁 Bucket já existe');
        }

        // 2. Configurar políticas RLS para o storage
        console.log('🔐 Configurando políticas RLS...');

        // Política para permitir que usuários façam upload de suas próprias imagens
        const uploadPolicy = `
      CREATE POLICY "Usuarios podem fazer upload de suas imagens" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = 'notas-fiscais' AND
        (storage.foldername(name))[1] = auth.uid()::text
      );
    `;

        // Política para permitir que usuários vejam suas próprias imagens
        const selectPolicy = `
      CREATE POLICY "Usuarios podem ver suas imagens" ON storage.objects
      FOR SELECT USING (
        bucket_id = 'notas-fiscais' AND
        (
          (storage.foldername(name))[1] = auth.uid()::text OR
          EXISTS (
            SELECT 1 FROM clientes_fast 
            WHERE id = auth.uid()::uuid 
            AND role IN ('admin', 'gerente')
          )
        )
      );
    `;

        // Política para permitir que usuários deletem suas próprias imagens
        const deletePolicy = `
      CREATE POLICY "Usuarios podem deletar suas imagens" ON storage.objects
      FOR DELETE USING (
        bucket_id = 'notas-fiscais' AND
        (
          (storage.foldername(name))[1] = auth.uid()::text OR
          EXISTS (
            SELECT 1 FROM clientes_fast 
            WHERE id = auth.uid()::uuid 
            AND role IN ('admin', 'gerente')
          )
        )
      );
    `;

        // Executar políticas via SQL (precisa ser feito no painel do Supabase ou via SQL direto)
        console.log('📋 Políticas RLS que devem ser aplicadas no painel do Supabase:');
        console.log('\n1. Upload Policy:');
        console.log(uploadPolicy);
        console.log('\n2. Select Policy:');
        console.log(selectPolicy);
        console.log('\n3. Delete Policy:');
        console.log(deletePolicy);

        console.log('\n✅ Configuração do storage concluída!');
        console.log('\n📝 Próximos passos:');
        console.log('1. Execute o script SQL 20_tabela_imagens_notas.sql no seu banco');
        console.log('2. Aplique as políticas RLS acima no painel do Supabase (Storage > Policies)');
        console.log('3. Teste o upload de imagens no sistema');

        return true;

    } catch (error) {
        console.error('❌ Erro na configuração:', error);
        return false;
    }
}

// Executar configuração
configurarSupabaseStorage();

export default configurarSupabaseStorage;
