import React, { useState } from 'react';
import styled from 'styled-components';
import { supabase } from '../services/supabase';

const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;

const Button = styled.button`
  background: #FF6B35;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  margin: 0.5rem;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Result = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 8px;
  background: ${props => props.success ? '#d4edda' : '#f8d7da'};
  color: ${props => props.success ? '#155724' : '#721c24'};
  border: 1px solid ${props => props.success ? '#c3e6cb' : '#f5c6cb'};
`;

const CriarTabelaPremios = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');
    const [success, setSuccess] = useState(false);

    const criarTabelaPremios = async () => {
        setLoading(true);
        setResult('');

        try {
            console.log('🔨 Criando tabela premios_catalogo...');

            // Criar tabela premios_catalogo
            const { error: tabelaError } = await supabase.rpc('execute_sql', {
                query: `
          CREATE TABLE IF NOT EXISTS premios_catalogo (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            nome VARCHAR(255) NOT NULL,
            descricao TEXT,
            categoria VARCHAR(100),
            pontos_necessarios INTEGER NOT NULL,
            valor_estimado DECIMAL(10,2),
            estoque_disponivel INTEGER DEFAULT 0,
            estoque_ilimitado BOOLEAN DEFAULT false,
            ativo BOOLEAN DEFAULT true,
            destaque BOOLEAN DEFAULT false,
            ordem_exibicao INTEGER DEFAULT 0,
            imagem_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
            });

            if (tabelaError) {
                throw new Error(`Erro ao criar tabela: ${tabelaError.message}`);
            }

            console.log('✅ Tabela premios_catalogo criada');

            // Criar tabela resgates
            const { error: resgatesError } = await supabase.rpc('execute_sql', {
                query: `
          CREATE TABLE IF NOT EXISTS resgates (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            cliente_id UUID REFERENCES clientes_fast(id),
            premio_id UUID REFERENCES premios_catalogo(id),
            pontos_utilizados INTEGER NOT NULL,
            quantidade INTEGER DEFAULT 1,
            status VARCHAR(20) DEFAULT 'confirmado',
            endereco_entrega TEXT,
            codigo_rastreamento VARCHAR(100),
            data_envio DATE,
            data_entrega DATE,
            data_resgate TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            observacoes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
            });

            if (resgatesError) {
                throw new Error(`Erro ao criar tabela resgates: ${resgatesError.message}`);
            }

            console.log('✅ Tabela resgates criada');
            setResult('✅ Tabelas criadas com sucesso!');
            setSuccess(true);

        } catch (error) {
            console.error('❌ Erro:', error);
            setResult(`❌ Erro: ${error.message}`);
            setSuccess(false);
        } finally {
            setLoading(false);
        }
    };

    const inserirDadosIniciais = async () => {
        setLoading(true);
        setResult('');

        try {
            console.log('📦 Inserindo dados iniciais...');

            const premios = [
                {
                    nome: 'Nível Laser',
                    descricao: 'Nível laser profissional para construção',
                    categoria: 'ferramentas',
                    pontos_necessarios: 10000,
                    valor_estimado: 500.00,
                    estoque_ilimitado: false,
                    ativo: true,
                    destaque: true,
                    ordem_exibicao: 1
                },
                {
                    nome: 'Parafusadeira',
                    descricao: 'Parafusadeira elétrica profissional',
                    categoria: 'ferramentas',
                    pontos_necessarios: 5000,
                    valor_estimado: 300.00,
                    estoque_ilimitado: false,
                    ativo: true,
                    destaque: true,
                    ordem_exibicao: 2
                },
                {
                    nome: 'Trena Digital',
                    descricao: 'Trena digital 5 metros',
                    categoria: 'ferramentas',
                    pontos_necessarios: 3000,
                    valor_estimado: 200.00,
                    estoque_ilimitado: false,
                    ativo: true,
                    destaque: true,
                    ordem_exibicao: 3
                },
                {
                    nome: 'Kit Brocas SDS',
                    descricao: 'Kit com 5 brocas SDS profissionais',
                    categoria: 'ferramentas',
                    pontos_necessarios: 1500,
                    valor_estimado: 80.00,
                    estoque_ilimitado: false,
                    ativo: true,
                    destaque: false,
                    ordem_exibicao: 4
                },
                {
                    nome: 'Vale-compras Fast',
                    descricao: 'Vale para compra de produtos Fast',
                    categoria: 'vale',
                    pontos_necessarios: 2000,
                    valor_estimado: 100.00,
                    estoque_ilimitado: true,
                    ativo: true,
                    destaque: true,
                    ordem_exibicao: 5
                },
                {
                    nome: 'Camiseta Fast',
                    descricao: 'Camiseta personalizada Fast Sistemas',
                    categoria: 'brinde',
                    pontos_necessarios: 1000,
                    valor_estimado: 50.00,
                    estoque_ilimitado: false,
                    ativo: true,
                    destaque: false,
                    ordem_exibicao: 6
                },
                {
                    nome: 'Boné Fast',
                    descricao: 'Boné com logo Fast Sistemas',
                    categoria: 'brinde',
                    pontos_necessarios: 800,
                    valor_estimado: 40.00,
                    estoque_ilimitado: false,
                    ativo: true,
                    destaque: false,
                    ordem_exibicao: 7
                }
            ];

            // Inserir prêmios
            const { error } = await supabase
                .from('premios_catalogo')
                .insert(premios);

            if (error) {
                throw new Error(`Erro ao inserir dados: ${error.message}`);
            }

            console.log('✅ Dados iniciais inseridos');
            setResult('✅ Dados iniciais inseridos com sucesso!');
            setSuccess(true);

        } catch (error) {
            console.error('❌ Erro:', error);
            setResult(`❌ Erro: ${error.message}`);
            setSuccess(false);
        } finally {
            setLoading(false);
        }
    };

    const verificarTabelas = async () => {
        setLoading(true);
        setResult('');

        try {
            console.log('🔍 Verificando tabelas...');

            // Verificar se a tabela existe
            const { data, error } = await supabase
                .from('premios_catalogo')
                .select('count')
                .limit(1);

            if (error) {
                throw new Error(`Tabela não existe: ${error.message}`);
            }

            const { data: premios, error: premiosError } = await supabase
                .from('premios_catalogo')
                .select('*')
                .limit(5);

            if (premiosError) {
                throw new Error(`Erro ao buscar prêmios: ${premiosError.message}`);
            }

            console.log('✅ Tabelas verificadas:', premios);
            setResult(`✅ Tabela existe! Encontrados ${premios.length} prêmios.`);
            setSuccess(true);

        } catch (error) {
            console.error('❌ Erro:', error);
            setResult(`❌ Erro: ${error.message}`);
            setSuccess(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <h2>🛠️ Configuração das Tabelas de Prêmios</h2>
            <p>Use este painel para criar e configurar as tabelas necessárias para o catálogo de prêmios.</p>

            <div>
                <Button onClick={verificarTabelas} disabled={loading}>
                    🔍 Verificar Tabelas
                </Button>

                <Button onClick={criarTabelaPremios} disabled={loading}>
                    🔨 Criar Tabelas
                </Button>

                <Button onClick={inserirDadosIniciais} disabled={loading}>
                    📦 Inserir Dados Iniciais
                </Button>
            </div>

            {loading && <p>⏳ Processando...</p>}

            {result && (
                <Result success={success}>
                    {result}
                </Result>
            )}
        </Container>
    );
};

export default CriarTabelaPremios;
