import ProdutosService from '../services/produtosService';

/**
 * Inicializa automaticamente os produtos elegíveis no banco de dados
 * Esta função é chamada automaticamente quando a aplicação carrega
 */
export const inicializarProdutosElegiveis = async () => {
    try {
        console.log('🔄 Verificando produtos elegíveis no banco de dados...');

        // Verificar se já existem produtos
        const resultado = await ProdutosService.obterTodosProdutos();

        if (resultado.success && resultado.data.length > 0) {
            console.log(`✅ ${resultado.data.length} produtos já existem no banco de dados`);
            return { success: true, message: 'Produtos já inicializados' };
        }

        console.log('📝 Inicializando produtos padrão...');

        // Produtos padrão do Clube Fast de Recompensas
        // Pontuação conforme estratégia: produtos de baixa margem = menos pontos, produtos estratégicos = mais pontos
        const produtosPadrao = [
            // PLACAS ST (0.5 pontos por R$ 1,00) - Produtos de baixa margem
            {
                codigo: 'PLACA_ST',
                nome: 'Placa ST',
                pontos_por_real: 0.5,
                categoria: 'placa_st',
                descricao: 'Placas ST para drywall - linha padrão (baixa margem)',
                ativa: true
            },
            {
                codigo: 'PLACA_ST_13MM',
                nome: 'Placa ST 13mm',
                pontos_por_real: 0.5,
                categoria: 'placa_st',
                descricao: 'Placa ST espessura 13mm',
                ativa: true
            },
            {
                codigo: 'PLACA_ST_15MM',
                nome: 'Placa ST 15mm',
                pontos_por_real: 0.5,
                categoria: 'placa_st',
                descricao: 'Placa ST espessura 15mm',
                ativa: true
            },

            // PLACAS RU (1.0 ponto por R$ 1,00) - Produtos intermediários
            {
                codigo: 'PLACA_RU',
                nome: 'Placa RU',
                pontos_por_real: 1.0,
                categoria: 'placa_ru',
                descricao: 'Placas RU resistentes à umidade',
                ativa: true
            },
            {
                codigo: 'PLACA_RU_13MM',
                nome: 'Placa RU 13mm',
                pontos_por_real: 1.0,
                categoria: 'placa_ru',
                descricao: 'Placa RU espessura 13mm',
                ativa: true
            },
            {
                codigo: 'PLACA_RU_15MM',
                nome: 'Placa RU 15mm',
                pontos_por_real: 1.0,
                categoria: 'placa_ru',
                descricao: 'Placa RU espessura 15mm',
                ativa: true
            },

            // PLACAS GLASROC X (2.0 pontos por R$ 1,00) - Produtos estratégicos e de valor agregado
            {
                codigo: 'PLACA_GLASROC_X',
                nome: 'Placa Glasroc X',
                pontos_por_real: 2.0,
                categoria: 'glasroc_x',
                descricao: 'Placas cimentícias Glasroc X - produto estratégico',
                ativa: true
            },
            {
                codigo: 'PLACA_GLASROC_X_10MM',
                nome: 'Placa Glasroc X 10mm',
                pontos_por_real: 2.0,
                categoria: 'glasroc_x',
                descricao: 'Placa Glasroc X espessura 10mm',
                ativa: true
            },
            {
                codigo: 'PLACA_GLASROC_X_12MM',
                nome: 'Placa Glasroc X 12mm',
                pontos_por_real: 2.0,
                categoria: 'glasroc_x',
                descricao: 'Placa Glasroc X espessura 12mm',
                ativa: true
            },

            // PLACOMIX (1.0 ponto por R$ 1,00) - Produto intermediário
            {
                codigo: 'PLACOMIX',
                nome: 'Placomix',
                pontos_por_real: 1.0,
                categoria: 'placomix',
                descricao: 'Massa para rejunte Placomix',
                ativa: true
            },
            {
                codigo: 'PLACOMIX_20KG',
                nome: 'Placomix 20kg',
                pontos_por_real: 1.0,
                categoria: 'placomix',
                descricao: 'Massa para rejunte Placomix embalagem 20kg',
                ativa: true
            },
            {
                codigo: 'PLACOMIX_25KG',
                nome: 'Placomix 25kg',
                pontos_por_real: 1.0,
                categoria: 'placomix',
                descricao: 'Massa para rejunte Placomix embalagem 25kg',
                ativa: true
            },

            // MALHA GLASROC X (2.0 pontos por R$ 1,00) - Produto estratégico
            {
                codigo: 'MALHA_GLASROC_X',
                nome: 'Malha telada para Glasroc X',
                pontos_por_real: 2.0,
                categoria: 'malha_glasroc',
                descricao: 'Malha telada para Glasroc X - acessório estratégico',
                ativa: true
            },
            {
                codigo: 'MALHA_GLASROC_50M',
                nome: 'Malha Glasroc X 50m',
                pontos_por_real: 2.0,
                categoria: 'malha_glasroc',
                descricao: 'Malha telada Glasroc X rolo 50m',
                ativa: true
            },

            // BASECOAT GLASROC X (2.0 pontos por R$ 1,00) - Produto estratégico
            {
                codigo: 'BASECOAT_GLASROC_X',
                nome: 'Basecoat (massa para Glasroc X)',
                pontos_por_real: 2.0,
                categoria: 'basecoat',
                descricao: 'Massa base para Glasroc X - produto de valor agregado',
                ativa: true
            },
            {
                codigo: 'BASECOAT_20KG',
                nome: 'Basecoat Glasroc X 20kg',
                pontos_por_real: 2.0,
                categoria: 'basecoat',
                descricao: 'Basecoat para Glasroc X embalagem 20kg',
                ativa: true
            }
        ];

        // Inserir produtos um por um
        let produtosInseridos = 0;
        for (const produto of produtosPadrao) {
            try {
                const resultadoInsercao = await ProdutosService.adicionarProduto(produto);
                if (resultadoInsercao.success) {
                    produtosInseridos++;
                    console.log(`✅ Produto ${produto.codigo} inserido com sucesso`);
                } else {
                    console.warn(`⚠️ Erro ao inserir ${produto.codigo}: ${resultadoInsercao.message}`);
                }
            } catch (error) {
                console.warn(`⚠️ Erro ao inserir ${produto.codigo}:`, error.message);
            }
        }

        console.log(`🎯 Inicialização concluída: ${produtosInseridos}/${produtosPadrao.length} produtos inseridos`);

        return {
            success: true,
            message: `${produtosInseridos} produtos inicializados com sucesso`,
            produtosInseridos
        };

    } catch (error) {
        console.error('❌ Erro ao inicializar produtos elegíveis:', error);
        return {
            success: false,
            message: 'Erro ao inicializar produtos',
            error: error.message
        };
    }
};

/**
 * Força a re-sincronização dos produtos do banco com a aplicação
 */
export const sincronizarProdutos = async () => {
    try {
        console.log('🔄 Sincronizando produtos...');

        // Obter produtos do banco
        const resultado = await ProdutosService.obterProdutosAtivos();

        if (resultado.success) {
            console.log(`✅ ${resultado.data.length} produtos ativos sincronizados`);
            return resultado.data;
        } else {
            throw new Error(resultado.message || 'Erro ao sincronizar produtos');
        }

    } catch (error) {
        console.error('❌ Erro ao sincronizar produtos:', error);
        throw error;
    }
};

export default {
    inicializarProdutosElegiveis,
    sincronizarProdutos
};
