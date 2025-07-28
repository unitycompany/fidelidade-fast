// Serviço para gerenciamento de produtos elegíveis no Supabase
import { supabase } from './supabase';
import { PRODUTOS_FAST, getCategoriasProdutos } from '../utils/pedidosFast';

export class ProdutosService {

    // Inicializar tabela de produtos com dados padrão
    static async inicializarProdutos() {
        try {
            // Verificar se já existem produtos na base
            const { data: existingProducts, error: checkError } = await supabase
                .from('produtos_elegiveis')
                .select('codigo')
                .limit(1);

            if (checkError) {
                throw checkError;
            }

            // Se já existem produtos, não fazer nada
            if (existingProducts && existingProducts.length > 0) {
                console.log('Produtos já inicializados na base de dados');
                return { success: true, message: 'Produtos já existem' };
            }

            // Converter PRODUTOS_FAST para formato da base de dados
            const produtosParaInserir = Object.entries(PRODUTOS_FAST).map(([codigo, produto]) => ({
                codigo,
                nome: produto.nome,
                pontos_por_real: produto.pontosPorReal,
                categoria: produto.categoria,
                descricao: produto.descricao,
                ativa: produto.ativa !== false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }));

            // Inserir produtos na base de dados
            const { data, error } = await supabase
                .from('produtos_elegiveis')
                .insert(produtosParaInserir);

            if (error) {
                throw error;
            }

            console.log(`${produtosParaInserir.length} produtos inicializados com sucesso`);
            return {
                success: true,
                message: `${produtosParaInserir.length} produtos inicializados`,
                data
            };

        } catch (error) {
            console.error('Erro ao inicializar produtos:', error);
            return {
                success: false,
                message: 'Erro ao inicializar produtos',
                error: error.message
            };
        }
    }

    // Obter todos os produtos ativos
    static async obterProdutosAtivos() {
        try {
            const { data, error } = await supabase
                .from('produtos_elegiveis')
                .select('*')
                .eq('ativa', true)
                .order('pontos_por_real', { ascending: false })
                .order('categoria', { ascending: true });

            if (error) {
                throw error;
            }

            return {
                success: true,
                data: data || []
            };

        } catch (error) {
            console.error('Erro ao obter produtos:', error);
            return {
                success: false,
                message: 'Erro ao carregar produtos',
                error: error.message,
                data: []
            };
        }
    }

    // Obter todos os produtos (ativos e inativos)
    static async obterTodosProdutos() {
        try {
            const { data, error } = await supabase
                .from('produtos_elegiveis')
                .select('*')
                .order('pontos_por_real', { ascending: false })
                .order('categoria', { ascending: true });

            if (error) {
                throw error;
            }

            return {
                success: true,
                data: data || []
            };

        } catch (error) {
            console.error('Erro ao obter todos os produtos:', error);
            return {
                success: false,
                message: 'Erro ao carregar produtos',
                error: error.message,
                data: []
            };
        }
    }

    // Adicionar novo produto
    static async adicionarProduto(produto) {
        try {
            // Validar dados obrigatórios
            if (!produto.codigo || !produto.nome || !produto.pontos_por_real || !produto.categoria) {
                throw new Error('Campos obrigatórios: código, nome, pontos por real e categoria');
            }

            // Verificar se o código já existe
            const { data: existing, error: checkError } = await supabase
                .from('produtos_elegiveis')
                .select('codigo')
                .eq('codigo', produto.codigo)
                .single();

            if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = não encontrado
                throw checkError;
            }

            if (existing) {
                throw new Error('Já existe um produto com este código');
            }

            // Preparar dados para inserção
            const novoProduto = {
                codigo: produto.codigo,
                nome: produto.nome,
                pontos_por_real: parseFloat(produto.pontos_por_real),
                categoria: produto.categoria,
                descricao: produto.descricao || '',
                ativa: produto.ativa !== false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('produtos_elegiveis')
                .insert([novoProduto])
                .select();

            if (error) {
                throw error;
            }

            return {
                success: true,
                message: 'Produto adicionado com sucesso',
                data: data[0]
            };

        } catch (error) {
            console.error('Erro ao adicionar produto:', error);
            return {
                success: false,
                message: error.message || 'Erro ao adicionar produto',
                error: error.message
            };
        }
    }

    // Atualizar produto existente
    static async atualizarProduto(codigo, dadosAtualizados) {
        try {
            // Preparar dados para atualização
            const produtoAtualizado = {
                ...dadosAtualizados,
                updated_at: new Date().toISOString()
            };

            // Remover campos que não devem ser atualizados
            delete produtoAtualizado.codigo;
            delete produtoAtualizado.created_at;

            const { data, error } = await supabase
                .from('produtos_elegiveis')
                .update(produtoAtualizado)
                .eq('codigo', codigo)
                .select();

            if (error) {
                throw error;
            }

            if (!data || data.length === 0) {
                throw new Error('Produto não encontrado');
            }

            return {
                success: true,
                message: 'Produto atualizado com sucesso',
                data: data[0]
            };

        } catch (error) {
            console.error('Erro ao atualizar produto:', error);
            return {
                success: false,
                message: error.message || 'Erro ao atualizar produto',
                error: error.message
            };
        }
    }

    // Desativar produto (não remove da base)
    static async desativarProduto(codigo) {
        try {
            const { data, error } = await supabase
                .from('produtos_elegiveis')
                .update({
                    ativa: false,
                    updated_at: new Date().toISOString()
                })
                .eq('codigo', codigo)
                .select();

            if (error) {
                throw error;
            }

            if (!data || data.length === 0) {
                throw new Error('Produto não encontrado');
            }

            return {
                success: true,
                message: 'Produto desativado com sucesso',
                data: data[0]
            };

        } catch (error) {
            console.error('Erro ao desativar produto:', error);
            return {
                success: false,
                message: error.message || 'Erro ao desativar produto',
                error: error.message
            };
        }
    }

    // Reativar produto
    static async reativarProduto(codigo) {
        try {
            const { data, error } = await supabase
                .from('produtos_elegiveis')
                .update({
                    ativa: true,
                    updated_at: new Date().toISOString()
                })
                .eq('codigo', codigo)
                .select();

            if (error) {
                throw error;
            }

            if (!data || data.length === 0) {
                throw new Error('Produto não encontrado');
            }

            return {
                success: true,
                message: 'Produto reativado com sucesso',
                data: data[0]
            };

        } catch (error) {
            console.error('Erro ao reativar produto:', error);
            return {
                success: false,
                message: error.message || 'Erro ao reativar produto',
                error: error.message
            };
        }
    }

    // Buscar produtos por termo
    static async buscarProdutos(termo) {
        try {
            const { data, error } = await supabase
                .from('produtos_elegiveis')
                .select('*')
                .or(`nome.ilike.%${termo}%,codigo.ilike.%${termo}%,categoria.ilike.%${termo}%`)
                .order('pontos_por_real', { ascending: false });

            if (error) {
                throw error;
            }

            return {
                success: true,
                data: data || []
            };

        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
            return {
                success: false,
                message: 'Erro ao buscar produtos',
                error: error.message,
                data: []
            };
        }
    }

    // Obter estatísticas dos produtos
    static async obterEstatisticas() {
        try {
            const { data, error } = await supabase
                .from('produtos_elegiveis')
                .select('categoria, ativa, pontos_por_real');

            if (error) {
                throw error;
            }

            const stats = {
                total: data.length,
                ativos: data.filter(p => p.ativa).length,
                inativos: data.filter(p => !p.ativa).length,
                categorias: {},
                pontuacaoMedia: 0
            };

            // Agrupar por categoria
            data.forEach(produto => {
                if (!stats.categorias[produto.categoria]) {
                    stats.categorias[produto.categoria] = {
                        total: 0,
                        ativos: 0,
                        pontos: produto.pontos_por_real
                    };
                }
                stats.categorias[produto.categoria].total++;
                if (produto.ativa) {
                    stats.categorias[produto.categoria].ativos++;
                }
            });

            // Calcular pontuação média
            if (data.length > 0) {
                stats.pontuacaoMedia = data.reduce((acc, p) => acc + p.pontos_por_real, 0) / data.length;
            }

            return {
                success: true,
                data: stats
            };

        } catch (error) {
            console.error('Erro ao obter estatísticas:', error);
            return {
                success: false,
                message: 'Erro ao obter estatísticas',
                error: error.message
            };
        }
    }

    // Sincronizar produtos da base com o mapeamento local
    static async sincronizarProdutos() {
        try {
            const { data: produtosBase } = await this.obterTodosProdutos();

            // Criar um mapa dos produtos da base por código
            const produtosBaseMap = {};
            produtosBase.forEach(produto => {
                produtosBaseMap[produto.codigo] = produto;
            });

            // Criar mapeamento dinâmico para usar no sistema
            const produtosDinamicos = {};
            produtosBase.filter(p => p.ativa).forEach(produto => {
                produtosDinamicos[produto.codigo] = {
                    nome: produto.nome,
                    pontosPorReal: produto.pontos_por_real,
                    categoria: produto.categoria,
                    descricao: produto.descricao,
                    ativa: produto.ativa
                };
            });

            return {
                success: true,
                data: produtosDinamicos,
                message: `${Object.keys(produtosDinamicos).length} produtos sincronizados`
            };

        } catch (error) {
            console.error('Erro ao sincronizar produtos:', error);
            return {
                success: false,
                message: 'Erro ao sincronizar produtos',
                error: error.message
            };
        }
    }

    // Remover produto permanentemente
    static async removerProduto(codigo) {
        try {
            const { data, error } = await supabase
                .from('produtos_elegiveis')
                .delete()
                .eq('codigo', codigo)
                .select();

            if (error) {
                throw error;
            }

            if (!data || data.length === 0) {
                throw new Error('Produto não encontrado');
            }

            return {
                success: true,
                message: 'Produto removido com sucesso',
                data: data[0]
            };

        } catch (error) {
            console.error('Erro ao remover produto:', error);
            return {
                success: false,
                message: error.message || 'Erro ao remover produto',
                error: error.message
            };
        }
    }
}

export default ProdutosService;
