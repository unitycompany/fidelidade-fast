import React, { useState } from 'react';
import styled from 'styled-components';
import { aiProcessor } from '../services/aiNotaProcessor';
import toast from 'react-hot-toast';
import { useAuth } from '../App';
import { processOrderResult } from '../utils/pedidosFast';
import { saveOrder, saveOrderItems, addPointsToCustomer } from '../services/supabase';

const Container = styled.div`
  padding: 2rem;
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.radii.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  max-width: 600px;
  margin: 2rem auto;
`;

const Input = styled.input`
  display: block;
  margin-bottom: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background: ${props => props.theme.colors.gradientPrimary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.radii.md};
  cursor: pointer;
`;

const Pre = styled.pre`
  background: ${props => props.theme.colors.gray100};
  padding: 1rem;
  border-radius: ${props => props.theme.radii.sm};
  max-height: 300px;
  overflow: auto;
`;

export default function UploadNotaAI() {
    const { user } = useAuth();
    const [file, setFile] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setResult(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            toast.error('Selecione uma imagem da nota');
            return;
        }
        try {
            setLoading(true);
            const aiData = await aiProcessor.processImage(file);
            const processed = await processOrderResult(aiData);

            // Salvar pedido com campos corretos
            const savedOrder = await saveOrder({
                cliente_id: user.id,
                numero_pedido: processed.orderNumber,
                data_emissao: processed.orderDate,
                valor_total: processed.totalValue,
                hash_documento: processed.documentHash,
                pontos_gerados: processed.totalPoints,
                status: 'processado'
            });

            // Salvar itens usando pedido_id retornado
            await Promise.all(processed.items.map(item =>
                saveOrderItems({
                    pedido_id: savedOrder.id,
                    codigo_produto: item.product_code,
                    nome_produto: item.product_name,
                    quantidade: item.quantity,
                    valor_unitario: item.unit_price,
                    valor_total: item.total_value,
                    pontos_calculados: item.points,
                    categoria: item.category,
                    produto_fast: true
                })
            ));

            // Adicionar pontos ao cliente com descrição
            await addPointsToCustomer(user.id, processed.totalPoints, `Pedido ${processed.orderNumber}`);

            // Atualizar contexto global do usuário após creditar pontos
            if (window.updateUserContext) {
                window.updateUserContext({
                    saldo_pontos: (user.saldo_pontos || 0) + processed.totalPoints,
                    total_pontos_ganhos: (user.total_pontos_ganhos || 0) + processed.totalPoints
                });
            }
            if (window.triggerGlobalRefresh) {
                window.triggerGlobalRefresh();
            }

            setResult(processed);
            toast.success('Pedido processado e pontos adicionados!');
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Erro ao processar nota');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <h2>Enviar Nota Fiscal para IA</h2>
            <form onSubmit={handleSubmit}>
                <Input type="file" accept="image/*" onChange={handleFileChange} />
                <Button type="submit" disabled={loading}>
                    {loading ? 'Processando...' : 'Enviar para IA'}
                </Button>
            </form>
            {result && (
                <div style={{ marginTop: '1rem' }}>
                    <h3>Sucesso! Pontos creditados: {result.totalPoints}</h3>
                    <p>Seus pontos foram adicionados à sua conta.</p>

                    <h4>Produtos Elegíveis:</h4>
                    <ul>
                        {result.items.map(item => (
                            <li key={item.product_code}>
                                {item.product_name}: {item.quantity} x R$ {item.unit_price.toFixed(2)} = R$ {item.total_value.toFixed(2)} — <strong>{item.points} pts</strong>
                            </li>
                        ))}
                    </ul>

                    <h4>Resumo:</h4>
                    <p>Total de produtos na nota: {result.allProducts.length}</p>
                    <p>Produtos elegíveis: {result.items.length}</p>
                    <p>Total de pontos ganhos: {result.totalPoints}</p>

                    <h4>Todos os Produtos:</h4>
                    <ul>
                        {result.allProducts.map(prod => (
                            <li key={prod.product_code}>
                                {prod.product_name} — {prod.isEligible ? 'Elegível' : 'Não elegível'} — {prod.points} pts
                            </li>
                        ))}
                    </ul>

                    <h4>Dados da IA (raw):</h4>
                    <Pre>{JSON.stringify(result, null, 2)}</Pre>
                </div>
            )}
        </Container>
    );
}
