import { supabase } from './supabase';

/**
 * Serviço para gerenciar upload e armazenamento de imagens de notas fiscais
 */
class ImagemNotaFiscalService {
    constructor() {
        this.bucketName = 'notas-fiscais';
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    }

    /**
     * Inicializar o bucket se não existir
     * CORRIGIDO: Pula verificação que falha por RLS
     */
    async inicializarBucket() {
        try {
            // Em vez de tentar listar buckets (que falha por RLS),
            // vamos fazer um teste direto de acesso ao bucket
            console.log('🔧 Testando acesso direto ao bucket...');

            const { data: files, error: testError } = await supabase
                .storage
                .from(this.bucketName)
                .list('', { limit: 1 });

            if (testError) {
                if (testError.message.includes('not found')) {
                    console.error('❌ Bucket não encontrado. Crie manualmente no painel do Supabase.');
                    return false;
                } else if (testError.message.includes('policy')) {
                    console.error('❌ Bucket existe mas faltam políticas RLS.');
                    return false;
                } else {
                    console.error('❌ Erro ao acessar bucket:', testError);
                    return false;
                }
            }

            console.log('✅ Bucket acessível e funcionando!');
            return true;

        } catch (error) {
            console.error('❌ Erro ao verificar bucket:', error);
            return false;
        }
    }

    /**
     * Validar arquivo antes do upload
     */
    validarArquivo(file) {
        const errors = [];

        if (!file) {
            errors.push('Nenhum arquivo selecionado');
            return errors;
        }

        // Verificar tipo
        if (!this.allowedTypes.includes(file.type)) {
            errors.push(`Tipo de arquivo não permitido. Tipos aceitos: ${this.allowedTypes.join(', ')}`);
        }

        // Verificar tamanho
        if (file.size > this.maxFileSize) {
            errors.push(`Arquivo muito grande. Tamanho máximo: ${this.maxFileSize / 1024 / 1024}MB`);
        }

        // Verificar nome
        if (!file.name || file.name.length < 3) {
            errors.push('Nome do arquivo inválido');
        }

        return errors;
    }

    /**
     * Gerar nome único para o arquivo
     */
    gerarNomeArquivo(clienteId, nomeOriginal) {
        const timestamp = Date.now();
        const extensao = nomeOriginal.split('.').pop();
        const nomeBase = nomeOriginal.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
        return `${clienteId}/${timestamp}_${nomeBase}.${extensao}`;
    }

    /**
     * Fazer upload da imagem para o Supabase Storage
     */
    async uploadImagem(file, clienteId, pedidoId = null, metadados = {}) {
        console.log('🚀 Iniciando upload de imagem:', {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            clienteId,
            pedidoId,
            metadados
        });

        try {
            // Validar arquivo
            const validationErrors = this.validarArquivo(file);
            if (validationErrors.length > 0) {
                console.error('❌ Validação falhou:', validationErrors);
                throw new Error(validationErrors.join(', '));
            }
            console.log('✅ Arquivo validado com sucesso');

            // Inicializar bucket se necessário
            console.log('🔧 Verificando/criando bucket...');
            const bucketReady = await this.inicializarBucket();
            if (!bucketReady) {
                throw new Error('Falha ao inicializar bucket');
            }
            console.log('✅ Bucket pronto');

            // Gerar nome único
            const nomeArquivo = this.gerarNomeArquivo(clienteId, file.name);
            console.log('📝 Nome do arquivo gerado:', nomeArquivo);

            // Upload para o Supabase Storage
            console.log('📤 Fazendo upload para o Supabase Storage...');
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from(this.bucketName)
                .upload(nomeArquivo, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                console.error('❌ Erro no upload para storage:', uploadError);
                throw uploadError;
            }
            console.log('✅ Upload para storage bem-sucedido:', uploadData);

            // Obter URL pública
            console.log('🔗 Obtendo URL pública...');
            const { data: { publicUrl } } = supabase.storage
                .from(this.bucketName)
                .getPublicUrl(nomeArquivo);
            console.log('✅ URL pública gerada:', publicUrl);

            // Obter IP
            const clientIP = await this.obterIP();
            console.log('🌐 IP do cliente obtido:', clientIP);

            // Salvar metadados no banco
            const imagemData = {
                pedido_id: pedidoId,
                cliente_id: clienteId,
                nome_arquivo: nomeArquivo,
                url_supabase: publicUrl,
                tipo_arquivo: file.type,
                tamanho_bytes: file.size,
                numero_nota: metadados.numeroNota || null,
                chave_acesso: metadados.chaveAcesso || null,
                status_upload: 'processado',
                ip_origem: clientIP,
                user_agent: navigator.userAgent
            };

            console.log('💾 Salvando metadados no banco:', imagemData);

            const { data: imagemRecord, error: dbError } = await supabase
                .from('imagens_notas_fiscais')
                .insert([imagemData])
                .select()
                .single();

            if (dbError) {
                console.error('❌ Erro ao salvar no banco:', dbError);
                // Se falhou ao salvar no banco, remover arquivo do storage
                console.log('🗑️ Removendo arquivo do storage devido ao erro no banco...');
                await this.removerImagem(nomeArquivo);
                throw dbError;
            }

            console.log('✅ Metadados salvos no banco:', imagemRecord);
            console.log('🎉 Upload completo com sucesso!');

            return {
                success: true,
                data: imagemRecord,
                url: publicUrl
            };

        } catch (error) {
            console.error('💥 Erro completo no upload:', {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint,
                stack: error.stack
            });

            return {
                success: false,
                error: error.message || 'Erro no upload da imagem',
                details: {
                    code: error.code,
                    details: error.details,
                    hint: error.hint
                }
            };
        }
    }

    /**
     * Listar imagens de um pedido
     */
    async listarImagensPedido(pedidoId) {
        try {
            const { data, error } = await supabase
                .from('imagens_notas_fiscais')
                .select('*')
                .eq('pedido_id', pedidoId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return {
                success: true,
                data: data || []
            };
        } catch (error) {
            console.error('Erro ao listar imagens:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Listar imagens de um cliente
     */
    async listarImagensCliente(clienteId, limit = 50) {
        try {
            const { data, error } = await supabase
                .from('imagens_notas_fiscais')
                .select(`
          *,
          pedidos_vendas (
            numero_pedido,
            data_emissao,
            valor_total_pedido
          )
        `)
                .eq('cliente_id', clienteId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;

            return {
                success: true,
                data: data || []
            };
        } catch (error) {
            console.error('Erro ao listar imagens do cliente:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Remover imagem
     */
    async removerImagem(nomeArquivo, imagemId = null) {
        try {
            // Remover do storage
            const { error: storageError } = await supabase.storage
                .from(this.bucketName)
                .remove([nomeArquivo]);

            if (storageError) {
                console.warn('Erro ao remover do storage:', storageError);
            }

            // Remover do banco se ID fornecido
            if (imagemId) {
                const { error: dbError } = await supabase
                    .from('imagens_notas_fiscais')
                    .delete()
                    .eq('id', imagemId);

                if (dbError) {
                    throw dbError;
                }
            }

            return {
                success: true,
                message: 'Imagem removida com sucesso'
            };
        } catch (error) {
            console.error('Erro ao remover imagem:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Obter IP do cliente (não bloqueia o upload se falhar)
     */
    async obterIP() {
        try {
            console.log('🌐 Obtendo IP do cliente...');
            const response = await fetch('https://api64.ipify.org?format=json', {
                timeout: 3000 // 3 segundos limite
            });
            const data = await response.json();
            console.log('✅ IP obtido:', data.ip);
            return data.ip;
        } catch (error) {
            console.warn('⚠️ Não foi possível obter IP (não crítico):', error.message);
            return '127.0.0.1'; // IP padrão se falhar
        }
    }

    /**
     * Upload alternativo para Cloudflare Images (backup)
     */
    async uploadCloudflare(file, clienteId, cloudflareConfig = {}) {
        // Implementação futura para Cloudflare Images
        // Necessário configurar API key e endpoint do Cloudflare
        console.log('Upload para Cloudflare não implementado ainda');
        return {
            success: false,
            error: 'Cloudflare upload não implementado'
        };
    }

    /**
     * Sincronizar imagem com Cloudflare (backup)
     */
    async sincronizarComCloudflare(imagemId) {
        // Implementação futura
        console.log('Sincronização com Cloudflare não implementada ainda');
        return false;
    }

    /**
     * Salvar registro de nota fiscal sem imagem (baseado nos dados do n8n)
     * @param {string} pedidoId - ID do pedido
     * @param {string} clienteId - ID do cliente
     * @param {object} dadosNota - Dados da nota fiscal extraídos pelo n8n
     * @param {string} origem - Origem dos dados ('input_manual' ou 'upload_imagem')
     */
    async salvarNotaFiscalDados(pedidoId, clienteId, dadosNota, origem = 'input_manual') {
        try {
            console.log('💾 [NOTA FISCAL] Salvando dados da nota fiscal:', {
                pedidoId,
                clienteId,
                dadosNota,
                origem
            });

            // Obter IP
            const clientIP = await this.obterIP();

            // Dados para inserir na tabela
            const notaData = {
                pedido_id: pedidoId,
                cliente_id: clienteId,
                nome_arquivo: `${origem}_${dadosNota.nota || Date.now()}.json`,
                tipo_arquivo: 'application/json',
                tamanho_bytes: JSON.stringify(dadosNota).length,
                numero_nota: dadosNota.nota || null,
                chave_acesso: dadosNota.chave_acesso || null,
                status_upload: 'processado',
                ip_origem: clientIP,
                user_agent: navigator.userAgent
            };

            console.log('💾 [NOTA FISCAL] Dados preparados para inserção:', notaData);

            // Inserir no banco de dados (n8n já validou duplicatas)
            const { data: notaRecord, error: dbError } = await supabase
                .from('imagens_notas_fiscais')
                .insert([notaData])
                .select()
                .single();

            if (dbError) {
                console.error('❌ [NOTA FISCAL] Erro ao salvar no banco:', dbError);
                throw dbError;
            }

            console.log('✅ [NOTA FISCAL] Nota fiscal salva com sucesso:', notaRecord);

            return {
                success: true,
                data: notaRecord
            };

        } catch (error) {
            console.error('💥 [NOTA FISCAL] Erro ao salvar nota fiscal:', error);
            return {
                success: false,
                error: error.message || 'Erro ao salvar nota fiscal'
            };
        }
    }

    /**
     * Verificar se uma nota fiscal já foi processada
     * @param {string} clienteId - ID do cliente
     * @param {string} numeroNota - Número da nota fiscal
     * @param {string} chaveAcesso - Chave de acesso (opcional)
     * @deprecated - Validação agora é feita pelo n8n
     */
    async verificarNotaExistente(clienteId, numeroNota, chaveAcesso = null) {
        console.warn('⚠️ [VERIFICAÇÃO] Função descontinuada - validação agora é feita pelo n8n');
        return { exists: false };
    }
}

// Instância singleton
const imagemNotaFiscalService = new ImagemNotaFiscalService();

export default imagemNotaFiscalService;
