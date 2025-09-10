/**
 * Serviço para integração com API SAP para consulta de dados de notas fiscais
 */
import { supabase } from './supabase';

class SapService {
    constructor() {
        // URL base da API do SAP (substitua pela URL real quando disponível)
        this.apiUrl = import.meta.env.VITE_SAP_API_URL || 'https://api-sap.exemplo.com/v1';
        this.apiKey = import.meta.env.VITE_SAP_API_KEY || '';
        
        // Verificar se as variáveis de ambiente estão configuradas
        if (!this.apiUrl.includes('exemplo.com')) {
            console.log('✅ API SAP configurada:', this.apiUrl);
        } else {
            console.warn('⚠️ URL da API SAP não configurada. Usando simulação local.');
        }
    }

    /**
     * Consulta nota fiscal pelo número no SAP
     * @param {string} numeroNfe - Número da nota fiscal eletrônica
     * @returns {Promise<object>} Dados da nota fiscal
     */
    async consultarNotaFiscalPorNumero(numeroNfe) {
        console.log('🔍 Consultando nota fiscal no SAP:', numeroNfe);

        try {
            // Validar o formato do número da NFe
            if (!numeroNfe || numeroNfe.length < 6) {
                throw new Error('Número da nota fiscal inválido');
            }

            // Se estiver em ambiente de desenvolvimento ou a API não estiver configurada, usar simulação
            if (import.meta.env.DEV || this.apiUrl.includes('exemplo.com')) {
                return await this.simularConsultaNfe(numeroNfe);
            }

            // Fazer requisição para a API real do SAP
            const response = await fetch(`${this.apiUrl}/notas-fiscais/${numeroNfe}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });

            if (!response.ok) {
                // Verificar erros específicos
                if (response.status === 404) {
                    throw new Error('Nota fiscal não encontrada no sistema SAP');
                } else if (response.status === 401 || response.status === 403) {
                    throw new Error('Acesso negado à API SAP. Verifique as credenciais');
                }
                throw new Error(`Erro na consulta SAP: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ Dados recebidos do SAP:', data);
            
            return {
                success: true,
                data
            };
        } catch (error) {
            console.error('❌ Erro ao consultar nota fiscal no SAP:', error);
            return {
                success: false,
                error: error.message || 'Erro desconhecido na consulta SAP'
            };
        }
    }

    /**
     * Atribui pontos ao cliente com base na nota fiscal
     * @param {string} clienteId - ID do cliente
     * @param {object} dadosNota - Dados da nota fiscal
     * @returns {Promise<object>} Resultado da operação
     */
    async atribuirPontosCliente(clienteId, dadosNota) {
        console.log('💰 Atribuindo pontos ao cliente:', { clienteId, dadosNota });

        try {
            // Validar dados necessários
            if (!clienteId) throw new Error('ID do cliente não informado');
            if (!dadosNota) throw new Error('Dados da nota fiscal não informados');
            if (!dadosNota.pontos) throw new Error('Pontos não informados na nota fiscal');

            // Registrar histórico de pontos
            const { data: historicoData, error: historicoError } = await supabase
                .from('historico_pontos')
                .insert([{
                    cliente_id: clienteId,
                    pontos: dadosNota.pontos,
                    tipo: 'credito',
                    descricao: `Nota fiscal #${dadosNota.numero || 'N/A'} - SAP`,
                    origem: 'sap_api',
                    valor_referencia: dadosNota.valorTotal || 0,
                    referencia_id: dadosNota.numero || null,
                    data_operacao: new Date().toISOString()
                }])
                .select()
                .single();

            if (historicoError) {
                throw historicoError;
            }

            // Atualizar saldo de pontos do cliente
            const { data: clienteData, error: clienteError } = await supabase
                .from('clientes')
                .update({
                    saldo_pontos: supabase.rpc('incrementar_pontos', { 
                        cliente_id_param: clienteId,
                        pontos_param: dadosNota.pontos 
                    })
                })
                .eq('id', clienteId)
                .select('saldo_pontos')
                .single();

            if (clienteError) {
                throw clienteError;
            }

            return {
                success: true,
                historicoId: historicoData?.id,
                pontos: dadosNota.pontos,
                saldoAtual: clienteData?.saldo_pontos
            };
        } catch (error) {
            console.error('❌ Erro ao atribuir pontos:', error);
            return {
                success: false,
                error: error.message || 'Erro ao atribuir pontos'
            };
        }
    }

    /**
     * Simulação local da consulta de nota fiscal (para desenvolvimento)
     * @param {string} numeroNfe - Número da nota fiscal
     * @returns {Promise<object>} Dados simulados
     */
    async simularConsultaNfe(numeroNfe) {
        console.log('🔄 Simulando consulta ao SAP para NFe:', numeroNfe);
        
        // Aguardar um pouco para simular latência de rede
        await new Promise(resolve => setTimeout(resolve, 800));

        // Gerar dados simulados com base no número da nota
        const seed = parseInt(numeroNfe.replace(/\D/g, '').slice(-4)) || 1234;
        const valorBase = (seed % 1000) + 500; // Valor entre 500 e 1499
        const pontos = Math.floor(valorBase / 20); // 1 ponto a cada R$ 20
        
        // Produtos simulados
        const produtos = [
            { codigo: 'FAST-001', descricao: 'Sistema Empresarial Fast', valor: valorBase * 0.6, pontos: Math.floor((valorBase * 0.6) / 20) },
            { codigo: 'FAST-002', descricao: 'Módulo Financeiro', valor: valorBase * 0.3, pontos: Math.floor((valorBase * 0.3) / 20) },
            { codigo: 'FAST-003', descricao: 'Suporte Técnico Premium', valor: valorBase * 0.1, pontos: Math.floor((valorBase * 0.1) / 20) }
        ];

        // Gerar data de emissão aleatória nos últimos 30 dias
        const hoje = new Date();
        const diasAtras = Math.floor(Math.random() * 30) + 1;
        const dataEmissao = new Date(hoje);
        dataEmissao.setDate(hoje.getDate() - diasAtras);
        
        // Dados simulados no formato esperado da API do SAP
        return {
            success: true,
            data: {
                numero: numeroNfe,
                chaveAcesso: `${seed}${Date.now()}`.padEnd(44, '0').slice(0, 44),
                dataEmissao: dataEmissao.toISOString().split('T')[0],
                valorTotal: valorBase.toFixed(2),
                pontos: pontos,
                cliente: {
                    nome: 'Cliente Simulado SAP',
                    documento: '123.456.789-00'
                },
                fornecedor: {
                    nome: 'Fast Sistemas LTDA',
                    cnpj: '12.345.678/0001-99'
                },
                produtos: produtos,
                situacao: 'AUTORIZADA',
                ambiente: 'HOMOLOGACAO'
            }
        };
    }
}

// Exportar instância única do serviço
const sapService = new SapService();
export default sapService;
