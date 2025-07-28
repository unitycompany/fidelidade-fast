// Utilitário para inicializar catálogo de prêmios no Supabase
// Este arquivo é executado automaticamente na inicialização do app

import { supabase } from '../services/supabase.js';

// Catálogo de prêmios inicial conforme especificação EXATA do cliente
export const PREMIOS_INICIAIS = [
    // EXATAMENTE CONFORME TABELA FORNECIDA
    {
        nome: 'Nível Laser',
        descricao: 'Nível laser profissional',
        categoria: 'ferramentas',
        pontos_necessarios: 10000,
        valor_estimado: 500.00,
        estoque_disponivel: 5,
        estoque_ilimitado: false,
        ativo: true,
        destaque: true,
        ordem_exibicao: 1,
        imagem_url: null
    },
    {
        nome: 'Parafusadeira',
        descricao: 'Parafusadeira elétrica profissional',
        categoria: 'ferramentas',
        pontos_necessarios: 5000,
        valor_estimado: 300.00,
        estoque_disponivel: 8,
        estoque_ilimitado: false,
        ativo: true,
        destaque: true,
        ordem_exibicao: 2,
        imagem_url: null
    },
    {
        nome: 'Trena Digital',
        descricao: 'Trena digital de precisão',
        categoria: 'ferramentas',
        pontos_necessarios: 3000,
        valor_estimado: 200.00,
        estoque_disponivel: 10,
        estoque_ilimitado: false,
        ativo: true,
        destaque: true,
        ordem_exibicao: 3,
        imagem_url: null
    },
    {
        nome: 'Kit Brocas SDS (5 unid.)',
        descricao: 'Kit com 5 brocas SDS profissionais',
        categoria: 'ferramentas',
        pontos_necessarios: 1500,
        valor_estimado: 80.00,
        estoque_disponivel: 15,
        estoque_ilimitado: false,
        ativo: true,
        destaque: false,
        ordem_exibicao: 4,
        imagem_url: null
    },
    {
        nome: 'Vale-compras em produtos Fast',
        descricao: 'Vale para compra de produtos Fast Sistemas',
        categoria: 'vale_compras',
        pontos_necessarios: 2000,
        valor_estimado: 100.00,
        estoque_disponivel: 0,
        estoque_ilimitado: true,
        ativo: true,
        destaque: true,
        ordem_exibicao: 5,
        imagem_url: null
    },
    {
        nome: 'Camiseta personalizada Fast',
        descricao: 'Camiseta personalizada com logo Fast Sistemas',
        categoria: 'brindes',
        pontos_necessarios: 1000,
        valor_estimado: 50.00,
        estoque_disponivel: 50,
        estoque_ilimitado: false,
        ativo: true,
        destaque: false,
        ordem_exibicao: 6,
        imagem_url: null
    },
    {
        nome: 'Boné Fast',
        descricao: 'Boné com logo Fast Sistemas',
        categoria: 'brindes',
        pontos_necessarios: 800,
        valor_estimado: 40.00,
        estoque_disponivel: 60,
        estoque_ilimitado: false,
        ativo: true,
        destaque: false,
        ordem_exibicao: 7,
        imagem_url: null
    }
];

// Função para verificar se os prêmios já foram inicializados
export async function verificarPremiosInicializados() {
    try {
        const { data, error } = await supabase
            .from('premios_catalogo')
            .select('id')
            .limit(1);

        if (error) {
            console.error('Erro ao verificar prêmios:', error);
            return false;
        }

        return data && data.length > 0;
    } catch (error) {
        console.error('Erro ao verificar prêmios inicializados:', error);
        return false;
    }
}

// Função para inicializar os prêmios
export async function inicializarPremios() {
    try {
        console.log('🎁 Verificando inicialização do catálogo de prêmios...');

        // Verificar se já existem prêmios
        const premiosExistem = await verificarPremiosInicializados();
        if (premiosExistem) {
            console.log('✅ Catálogo de prêmios já inicializado');
            return { success: true, message: 'Prêmios já inicializados' };
        }

        console.log('🔄 Inicializando catálogo de prêmios EXATOS...');

        // Inserir apenas os prêmios EXATOS da tabela
        const { data, error } = await supabase
            .from('premios_catalogo')
            .insert(PREMIOS_INICIAIS)
            .select();

        if (error) {
            console.error('❌ Erro ao inserir prêmios:', error);
            return { success: false, error: error.message };
        }

        console.log(`✅ ${data.length} prêmios inseridos conforme tabela fornecida!`);

        // Estatísticas por categoria
        const estatisticas = PREMIOS_INICIAIS.reduce((acc, premio) => {
            acc[premio.categoria] = (acc[premio.categoria] || 0) + 1;
            return acc;
        }, {});

        console.log('📊 Estatísticas do catálogo:');
        Object.entries(estatisticas).forEach(([categoria, total]) => {
            console.log(`   ${categoria}: ${total} prêmios`);
        });

        // Log dos prêmios inseridos
        console.log('📋 PRÊMIOS CONFORME TABELA FORNECIDA:');
        data.forEach(p => {
            console.log(`   • ${p.nome} - ${p.pontos_necessarios} pts - R$ ${p.valor_estimado}`);
        });

        return {
            success: true,
            message: `Catálogo inicializado com ${data.length} prêmios EXATOS`,
            estatisticas
        };

    } catch (error) {
        console.error('❌ Erro na inicialização dos prêmios:', error);
        return { success: false, error: error.message };
    }
}

// Função para atualizar prêmios existentes (para desenvolvimento)
export async function atualizarPremios() {
    try {
        console.log('🔄 Atualizando catálogo de prêmios...');

        const resultados = [];

        for (const premio of PREMIOS_INICIAIS) {
            const { data, error } = await supabase
                .from('premios_catalogo')
                .upsert(premio, { onConflict: 'nome' })
                .select();

            if (error) {
                console.error(`Erro ao atualizar ${premio.nome}:`, error);
            } else {
                resultados.push(data[0]);
            }
        }

        console.log(`✅ ${resultados.length} prêmios atualizados!`);
        return { success: true, message: `${resultados.length} prêmios atualizados` };

    } catch (error) {
        console.error('❌ Erro na atualização dos prêmios:', error);
        return { success: false, error: error.message };
    }
}

// Função para listar prêmios em destaque
export async function listarPremiosDestaque() {
    try {
        const { data, error } = await supabase
            .from('premios_catalogo')
            .select('*')
            .eq('destaque', true)
            .eq('ativo', true)
            .order('ordem_exibicao');

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Erro ao listar prêmios destaque:', error);
        return { success: false, error: error.message };
    }
}

// Função para listar prêmios por categoria
export async function listarPremiosPorCategoria(categoria) {
    try {
        const { data, error } = await supabase
            .from('premios_catalogo')
            .select('*')
            .eq('categoria', categoria)
            .eq('ativo', true)
            .order('ordem_exibicao');

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error(`Erro ao listar prêmios da categoria ${categoria}:`, error);
        return { success: false, error: error.message };
    }
}

// Categorias disponíveis - SIMPLIFICADAS
export const CATEGORIAS_PREMIOS = {
    ferramentas: 'Ferramentas',
    vale_compras: 'Vale-Compras',
    brindes: 'Brindes'
};

export default {
    verificarPremiosInicializados,
    inicializarPremios,
    atualizarPremios,
    listarPremiosDestaque,
    listarPremiosPorCategoria,
    PREMIOS_INICIAIS,
    CATEGORIAS_PREMIOS
};
