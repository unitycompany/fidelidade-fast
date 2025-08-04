import { supabase } from '../services/supabase';

/**
 * Versão simplificada do upload para teste
 */
export default async function uploadSimplificado(file, clienteId) {
    console.log('🚀 Upload simplificado iniciado...');

    try {
        // 1. Validações básicas
        if (!file) throw new Error('Arquivo não fornecido');
        if (!clienteId) throw new Error('Cliente ID não fornecido');

        console.log('📄 Arquivo:', file.name, file.type, file.size);
        console.log('👤 Cliente:', clienteId);

        // 2. Gerar nome simples
        const timestamp = Date.now();
        const extensao = file.name.split('.').pop();
        const nomeArquivo = `${clienteId}/${timestamp}.${extensao}`;
        console.log('📝 Nome gerado:', nomeArquivo);

        // 3. Upload direto (sem verificar bucket)
        console.log('📤 Fazendo upload direto...');
        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('notas-fiscais')
            .upload(nomeArquivo, file);

        if (uploadError) {
            console.error('❌ Erro no upload:', uploadError);
            throw uploadError;
        }

        console.log('✅ Upload bem-sucedido:', uploadData);

        // 4. URL pública
        const { data: { publicUrl } } = supabase
            .storage
            .from('notas-fiscais')
            .getPublicUrl(nomeArquivo);

        console.log('🔗 URL:', publicUrl);

        // 5. Salvar no banco (simplificado)
        console.log('💾 Salvando no banco...');
        const { data: dbData, error: dbError } = await supabase
            .from('imagens_notas_fiscais')
            .insert({
                cliente_id: clienteId,
                nome_arquivo: nomeArquivo,
                url_supabase: publicUrl,
                tipo_arquivo: file.type,
                tamanho_bytes: file.size,
                status_upload: 'processado',
                ip_origem: '127.0.0.1',
                user_agent: navigator.userAgent
            })
            .select()
            .single();

        if (dbError) {
            console.error('❌ Erro no banco:', dbError);

            // Remover arquivo do storage se banco falhou
            await supabase.storage.from('notas-fiscais').remove([nomeArquivo]);
            throw dbError;
        }

        console.log('✅ Salvo no banco:', dbData);

        return {
            success: true,
            data: dbData,
            url: publicUrl
        };

    } catch (error) {
        console.error('💥 Erro no upload simplificado:', error);
        return {
            success: false,
            error: error.message,
            details: error
        };
    }
}

// Disponibilizar no console para teste
window.uploadSimplificado = uploadSimplificado;
