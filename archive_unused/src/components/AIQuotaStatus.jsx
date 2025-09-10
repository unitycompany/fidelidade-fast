import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiZap, FiInfo, FiAlertCircle } from 'react-icons/fi';

const StatusContainer = styled.div`
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.radii.md};
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid ${props => props.theme.colors.gray200};
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const StatusIcon = styled.div`
  color: ${props => {
        if (props.status === 'warning') return '#f59e0b';
        if (props.status === 'error') return '#ef4444';
        return '#10b981';
    }};
  font-size: 1.25rem;
`;

const StatusInfo = styled.div`
  flex: 1;
  
  h4 {
    margin: 0 0 0.25rem 0;
    font-size: 0.9rem;
    color: ${props => props.theme.colors.text};
  }
  
  p {
    margin: 0;
    font-size: 0.8rem;
    color: ${props => props.theme.colors.gray600};
  }
`;

const QuotaBar = styled.div`
  width: 100px;
  height: 8px;
  background: ${props => props.theme.colors.gray200};
  border-radius: 4px;
  overflow: hidden;
  
  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${props => Math.min(100, props.percentage)}%;
    background: ${props => {
        if (props.percentage > 80) return '#ef4444';
        if (props.percentage > 60) return '#f59e0b';
        return '#10b981';
    }};
    transition: width 0.3s ease;
  }
`;

function AIQuotaStatus({ quota = null, usage = null, showDetails = true }) {
    const [status, setStatus] = useState('normal');
    const [message, setMessage] = useState('');
    const [percentage, setPercentage] = useState(0);

    useEffect(() => {
        if (quota && usage) {
            const usagePercent = (usage / quota) * 100;
            setPercentage(usagePercent);

            if (usagePercent >= 90) {
                setStatus('error');
                setMessage('Cota quase esgotada! Limite de processamento próximo.');
            } else if (usagePercent >= 70) {
                setStatus('warning');
                setMessage('Atenção: Cota de IA sendo consumida rapidamente.');
            } else {
                setStatus('normal');
                setMessage('Sistema de IA funcionando normalmente.');
            }
        } else {
            setStatus('normal');
            setMessage('Aguardando dados de cota...');
            setPercentage(0);
        }
    }, [quota, usage]);

    if (!showDetails) {
        return null;
    }

    const getIcon = () => {
        switch (status) {
            case 'error':
                return <FiAlertCircle />;
            case 'warning':
                return <FiInfo />;
            default:
                return <FiZap />;
        }
    };

    return (
        <StatusContainer>
            <StatusIcon status={status}>
                {getIcon()}
            </StatusIcon>

            <StatusInfo>
                <h4>Status do Sistema IA</h4>
                <p>{message}</p>
            </StatusInfo>

            {quota && usage && (
                <div style={{ textAlign: 'center' }}>
                    <QuotaBar percentage={percentage} />
                    <p style={{ fontSize: '0.7rem', margin: '0.25rem 0 0 0', color: '#6b7280' }}>
                        {usage}/{quota}
                    </p>
                </div>
            )}
        </StatusContainer>
    );
}

export default AIQuotaStatus;
