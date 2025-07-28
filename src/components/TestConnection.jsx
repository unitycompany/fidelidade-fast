import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { FiCheck, FiX, FiDatabase, FiSettings, FiUsers, FiPackage } from 'react-icons/fi'
import { supabase } from '../services/supabase'
import { Container, Card, CardHeader, CardContent, Heading, Text, Flex, LoadingSpinner } from '../styles/GlobalStyle'

const TestConnection = () => {
    const [connectionStatus, setConnectionStatus] = useState('testing')
    const [tableStatus, setTableStatus] = useState({})
    const [stats, setStats] = useState({})

    useEffect(() => {
        testConnection()
    }, [])

    const testConnection = async () => {
        try {
            // Testar conexão básica
            const { data, error } = await supabase
                .from('configuracoes_sistema')
                .select('*')
                .limit(1)

            if (error) {
                setConnectionStatus('error')
                console.error('Erro de conexão:', error)
                return
            }

            setConnectionStatus('connected')

            // Testar todas as tabelas
            await testAllTables()

            // Buscar estatísticas
            await loadStats()

        } catch (error) {
            setConnectionStatus('error')
            console.error('Erro:', error)
        }
    }

    const testAllTables = async () => {
        const tables = [
            'clientes_fast',
            'fornecedores_fast',
            'pedidos_vendas',
            'produtos_fast_catalogo',
            'itens_pedido',
            'historico_pontos',
            'premios_catalogo',
            'resgates',
            'configuracoes_sistema'
        ]

        const status = {}

        for (const table of tables) {
            try {
                const { data, error } = await supabase
                    .from(table)
                    .select('*', { count: 'exact' })
                    .limit(1)

                status[table] = {
                    exists: !error,
                    count: data?.length || 0,
                    error: error?.message
                }
            } catch (err) {
                status[table] = {
                    exists: false,
                    error: err.message
                }
            }
        }

        setTableStatus(status)
    }

    const loadStats = async () => {
        try {
            // Contar registros em tabelas principais
            const [fornecedores, produtos, premios, config] = await Promise.all([
                supabase.from('fornecedores_fast').select('*', { count: 'exact' }),
                supabase.from('produtos_fast_catalogo').select('*', { count: 'exact' }),
                supabase.from('premios_catalogo').select('*', { count: 'exact' }),
                supabase.from('configuracoes_sistema').select('*').single()
            ])

            setStats({
                fornecedores: fornecedores.count || 0,
                produtos: produtos.count || 0,
                premios: premios.count || 0,
                sistemaAtivo: config.data?.sistema_ativo || false
            })

        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error)
        }
    }

    const getStatusIcon = (status) => {
        if (status === 'testing') return <LoadingSpinner size={4} />
        if (status === 'connected') return <FiCheck color="#28A745" size={20} />
        return <FiX color="#DC3545" size={20} />
    }

    const getStatusColor = (exists) => {
        return exists ? '#28A745' : '#DC3545'
    }

    return (
        <Container>
            <TestHeader>
                <Heading size="3xl" color="primary" mb={2}>
                    🚀 Clube Fast de Recompensas
                </Heading>
                <Text size="lg" color="textSecondary">
                    Sistema de Fidelidade - Teste de Conexão
                </Text>
            </TestHeader>

            {/* Status da Conexão */}
            <Card>
                <CardHeader>
                    <Flex align="center" gap={3}>
                        <FiDatabase size={24} />
                        <Heading size="lg">Status da Conexão Supabase</Heading>
                        {getStatusIcon(connectionStatus)}
                    </Flex>
                </CardHeader>
                <CardContent>
                    <ConnectionStatus status={connectionStatus}>
                        {connectionStatus === 'testing' && 'Testando conexão...'}
                        {connectionStatus === 'connected' && '✅ Conectado com sucesso!'}
                        {connectionStatus === 'error' && '❌ Erro na conexão'}
                    </ConnectionStatus>
                </CardContent>
            </Card>

            {/* Estatísticas Rápidas */}
            {connectionStatus === 'connected' && (
                <StatsGrid>
                    <StatCard>
                        <StatIcon>
                            <FiUsers />
                        </StatIcon>
                        <StatInfo>
                            <StatNumber>{stats.fornecedores}</StatNumber>
                            <StatLabel>Fornecedores</StatLabel>
                        </StatInfo>
                    </StatCard>

                    <StatCard>
                        <StatIcon>
                            <FiPackage />
                        </StatIcon>
                        <StatInfo>
                            <StatNumber>{stats.produtos}</StatNumber>
                            <StatLabel>Produtos</StatLabel>
                        </StatInfo>
                    </StatCard>

                    <StatCard>
                        <StatIcon>
                            <FiSettings />
                        </StatIcon>
                        <StatInfo>
                            <StatNumber>{stats.premios}</StatNumber>
                            <StatLabel>Prêmios</StatLabel>
                        </StatInfo>
                    </StatCard>

                    <StatCard>
                        <StatIcon style={{ color: stats.sistemaAtivo ? '#28A745' : '#DC3545' }}>
                            <FiCheck />
                        </StatIcon>
                        <StatInfo>
                            <StatLabel>{stats.sistemaAtivo ? 'Sistema Ativo' : 'Sistema Inativo'}</StatLabel>
                        </StatInfo>
                    </StatCard>
                </StatsGrid>
            )}

            {/* Status das Tabelas */}
            {connectionStatus === 'connected' && Object.keys(tableStatus).length > 0 && (
                <Card>
                    <CardHeader>
                        <Heading size="lg">Status das Tabelas</Heading>
                    </CardHeader>
                    <CardContent>
                        <TableGrid>
                            {Object.entries(tableStatus).map(([table, status]) => (
                                <TableStatus key={table}>
                                    <Flex align="center" gap={2}>
                                        <FiCheck
                                            size={16}
                                            color={getStatusColor(status.exists)}
                                        />
                                        <TableName>{table}</TableName>
                                    </Flex>
                                    {status.error && (
                                        <TableError>{status.error}</TableError>
                                    )}
                                </TableStatus>
                            ))}
                        </TableGrid>
                    </CardContent>
                </Card>
            )}

            {connectionStatus === 'connected' && (
                <ActionCard>
                    <Heading size="lg" mb={3}>🎯 Próximos Passos</Heading>
                    <ActionList>
                        <ActionItem>✅ Banco de dados configurado</ActionItem>
                        <ActionItem>✅ Tabelas criadas com sucesso</ActionItem>
                        <ActionItem>✅ Dados iniciais inseridos</ActionItem>
                        <ActionItem>🔄 Próximo: Criar interface de upload</ActionItem>
                    </ActionList>
                </ActionCard>
            )}
        </Container>
    )
}

// Styled Components
const TestHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing[8]};
  padding: ${({ theme }) => theme.spacing[8]} 0;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
  color: white;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`

const ConnectionStatus = styled.div`
  padding: ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  background: ${({ status, theme }) => {
        if (status === 'connected') return theme.colors.success + '20'
        if (status === 'error') return theme.colors.error + '20'
        return theme.colors.gray100
    }};
  color: ${({ status, theme }) => {
        if (status === 'connected') return theme.colors.success
        if (status === 'error') return theme.colors.error
        return theme.colors.text
    }};
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[6]};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[4]};
`

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme }) => theme.colors.primary + '20'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 20px;
`

const StatInfo = styled.div`
  display: flex;
  flex-direction: column;
`

const StatNumber = styled.div`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
`

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`

const TableGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing[3]};
`

const TableStatus = styled.div`
  padding: ${({ theme }) => theme.spacing[3]};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.gray50};
`

const TableName = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`

const TableError = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.error};
  margin-top: ${({ theme }) => theme.spacing[1]};
`

const ActionCard = styled(Card)`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.accent + '10'}, ${({ theme }) => theme.colors.primary + '05'});
  border: 2px solid ${({ theme }) => theme.colors.primary + '30'};
`

const ActionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`

const ActionItem = styled.div`
  padding: ${({ theme }) => theme.spacing[2]};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text};
`

export default TestConnection
