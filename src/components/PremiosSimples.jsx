import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled.h1`
  color: ${props => props.theme?.colors?.primary || '#FF6B35'};
  text-align: center;
  margin-bottom: 2rem;
`;

const PremiosSimples = ({ usuario, onUserUpdate }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        console.log('🎯 Componente PremiosSimples montado');
        console.log('👤 Usuário recebido:', usuario);

        // Simular carregamento
        setTimeout(() => {
            console.log('✅ Carregamento finalizado');
            setLoading(false);
        }, 2000);
    }, [usuario]);

    if (loading) {
        return (
            <Container>
                <Title>🏆 Carregando Prêmios...</Title>
                <div style={{ textAlign: 'center' }}>
                    <p>Aguarde, carregando dados...</p>
                </div>
            </Container>
        );
    }

    return (
        <Container>
            <Title>🏆 Catálogo de Prêmios</Title>
            <div style={{ textAlign: 'center' }}>
                <p>Componente funcionando!</p>
                <p>Usuário: {usuario?.nome || 'Não identificado'}</p>
                <p>ID: {usuario?.id || 'N/A'}</p>
                {error && <p style={{ color: 'red' }}>Erro: {error}</p>}
            </div>
        </Container>
    );
};

export default PremiosSimples;
