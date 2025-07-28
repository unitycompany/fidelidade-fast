import React, { useState } from 'react'
import styled from 'styled-components'
import { supabase } from '../services/supabase'

const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`

const Button = styled.button`
  background: #667eea;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  margin: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #5a6fd8;
    transform: translateY(-2px);
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
  }
`

const ResultBox = styled.div`
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  font-family: monospace;
  white-space: pre-wrap;
  max-height: 400px;
  overflow-y: auto;
`

const Title = styled.h2`
  color: #333;
  margin-bottom: 1rem;
`

function DatabaseDebug() {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState('')

    const verificarEstrutura = async () => {
        setLoading(true)
        setResult('Verificando estrutura da tabela...')

        try {
            const { data, error } = await supabase
                .from('clientes_fast')
                .select('*')
                .limit(1)

            if (error) {
                setResult(`Erro: ${error.message}`)
            } else {
                setResult(`✅ Tabela existe e funcionando!\nDados de exemplo: ${JSON.stringify(data, null, 2)}`)
            }
        } catch (error) {
            setResult(`❌ Erro: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    const verificarColunaStatus = async () => {
        setLoading(true)
        setResult('Verificando coluna status...')

        try {
            const { data, error } = await supabase
                .from('clientes_fast')
                .select('id, status')
                .limit(1)

            if (error) {
                setResult(`❌ Erro na coluna status: ${error.message}`)
            } else {
                setResult(`✅ Coluna status existe e funcionando!\nDados: ${JSON.stringify(data, null, 2)}`)
            }
        } catch (error) {
            setResult(`❌ Erro: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    const criarTabelaCompleta = async () => {
        setLoading(true)
        setResult('Executando script de criação/atualização...')

        try {
            // Script SQL para executar no Supabase
            const sqlScript = `
-- Script de correção da tabela
DO $$ 
BEGIN
    -- Adicionar coluna tipo se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='clientes_fast' AND column_name='tipo') THEN
        ALTER TABLE clientes_fast ADD COLUMN tipo VARCHAR(10) DEFAULT 'CPF';
    END IF;
    
    -- Adicionar coluna status se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='clientes_fast' AND column_name='status') THEN
        ALTER TABLE clientes_fast ADD COLUMN status VARCHAR(20) DEFAULT 'ativo';
    END IF;
    
    -- Adicionar coluna senha se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='clientes_fast' AND column_name='senha') THEN
        ALTER TABLE clientes_fast ADD COLUMN senha VARCHAR(255);
    END IF;
END $$;
      `

            setResult(`Script SQL para executar no Supabase SQL Editor:\n\n${sqlScript}\n\n⚠️ Copie o script acima e execute no SQL Editor do Supabase.`)

        } catch (error) {
            setResult(`❌ Erro: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    const testarInsercao = async () => {
        setLoading(true)
        setResult('Testando inserção de dados...')

        try {
            const testUser = {
                nome: 'Usuário Teste',
                cpf_cnpj: '12345678901',
                tipo: 'CPF',
                status: 'ativo',
                senha: 'teste123',
                saldo_pontos: 0,
                total_pontos_ganhos: 0,
                total_pontos_gastos: 0
            }

            const { data, error } = await supabase
                .from('clientes_fast')
                .insert([testUser])
                .select()

            if (error) {
                setResult(`❌ Erro na inserção: ${error.message}`)
            } else {
                setResult(`✅ Inserção bem-sucedida!\nDados inseridos: ${JSON.stringify(data, null, 2)}`)
            }
        } catch (error) {
            setResult(`❌ Erro: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    const verificarPoliticas = async () => {
        setLoading(true)
        setResult('Verificando políticas RLS...')

        try {
            // Tentar fazer uma consulta simples
            const { data, error } = await supabase
                .from('clientes_fast')
                .select('count')
                .single()

            if (error && error.code === '42501') {
                setResult(`⚠️ Problema de RLS detectado: ${error.message}\n\nExecute no SQL Editor:\nCREATE POLICY "Permitir_Acesso_Total" ON clientes_fast FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);`)
            } else {
                setResult(`✅ Políticas RLS funcionando corretamente!`)
            }
        } catch (error) {
            setResult(`❌ Erro: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    const limparResultados = () => {
        setResult('')
    }

    return (
        <Container>
            <Title>🔧 Debug do Banco de Dados</Title>

            <div>
                <Button onClick={verificarEstrutura} disabled={loading}>
                    1. Verificar Estrutura
                </Button>

                <Button onClick={verificarColunaStatus} disabled={loading}>
                    2. Verificar Coluna STATUS
                </Button>

                <Button onClick={criarTabelaCompleta} disabled={loading}>
                    3. Gerar Script SQL
                </Button>

                <Button onClick={testarInsercao} disabled={loading}>
                    4. Testar Inserção
                </Button>

                <Button onClick={verificarPoliticas} disabled={loading}>
                    5. Verificar Políticas RLS
                </Button>

                <Button onClick={limparResultados} disabled={loading}>
                    🗑️ Limpar
                </Button>
            </div>

            {result && (
                <ResultBox>
                    {result}
                </ResultBox>
            )}

            {loading && (
                <div style={{ textAlign: 'center', margin: '2rem 0' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '4px solid #f3f3f3',
                        borderTop: '4px solid #667eea',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto'
                    }}></div>
                    <p>Processando...</p>
                </div>
            )}
        </Container>
    )
}

export default DatabaseDebug
