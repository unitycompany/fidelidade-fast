import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const shimmer = keyframes`
  0% { background-position: -468px 0; }
  100% { background-position: 468px 0; }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: ${props => props.$minHeight || '200px'};
  padding: 2rem;
  text-align: center;
`;

const Spinner = styled.div`
  width: ${props => props.size || '40px'};
  height: ${props => props.size || '40px'};
  border: 4px solid #f3f3f3;
  border-top: 4px solid ${props => props.color || props.theme?.colors?.primary || '#FF6B35'};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 1rem;
`;

const LoadingText = styled.p`
  color: ${props => props.theme?.colors?.textSecondary || '#6c757d'};
  font-size: 1rem;
  margin: 0;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const SkeletonBox = styled.div`
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: ${props => props.radius || '8px'};
  height: ${props => props.height || '20px'};
  width: ${props => props.width || '100%'};
  margin: ${props => props.margin || '0'};
`;

const SkeletonCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
`;

const SkeletonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  width: 100%;
`;

// Componente Loading Simples
export function LoadingSpinner({ size, color, text, minHeight }) {
    return (
        <LoadingContainer $minHeight={minHeight}>
            <Spinner size={size} color={color} />
            {text && <LoadingText>{text}</LoadingText>}
        </LoadingContainer>
    );
}

// Componente Skeleton para Cards
export function SkeletonCardLoader({ count = 1 }) {
    return (
        <SkeletonGrid>
            {Array.from({ length: count }, (_, index) => (
                <SkeletonCard key={index}>
                    <SkeletonBox height="60px" width="60px" radius="50%" margin="0 auto 1rem" />
                    <SkeletonBox height="24px" width="70%" margin="0 auto 0.5rem" />
                    <SkeletonBox height="16px" width="90%" margin="0 auto 0.5rem" />
                    <SkeletonBox height="16px" width="60%" margin="0 auto 1rem" />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <SkeletonBox height="20px" width="30%" />
                        <SkeletonBox height="40px" width="35%" />
                    </div>
                </SkeletonCard>
            ))}
        </SkeletonGrid>
    );
}

// Componente Skeleton para Dashboard
export function SkeletonDashboard() {
    return (
        <div style={{ padding: '2rem' }}>
            {/* Header Skeleton */}
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <SkeletonBox height="40px" width="60%" margin="0 auto 1rem" />
                <SkeletonBox height="60px" width="300px" margin="0 auto" />
            </div>

            {/* Stats Grid Skeleton */}
            <SkeletonGrid>
                {Array.from({ length: 4 }, (_, index) => (
                    <SkeletonCard key={index}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <SkeletonBox height="20px" width="40%" />
                            <SkeletonBox height="60px" width="60px" radius="12px" />
                        </div>
                        <SkeletonBox height="36px" width="50%" />
                    </SkeletonCard>
                ))}
            </SkeletonGrid>

            {/* Actions Grid Skeleton */}
            <div style={{ marginTop: '3rem' }}>
                <SkeletonBox height="32px" width="200px" margin="0 auto 2rem" />
                <SkeletonGrid>
                    {Array.from({ length: 3 }, (_, index) => (
                        <SkeletonCard key={index}>
                            <SkeletonBox height="80px" width="80px" radius="16px" margin="0 auto 1rem" />
                            <SkeletonBox height="24px" width="60%" margin="0 auto 0.5rem" />
                            <SkeletonBox height="48px" width="90%" margin="0 auto" />
                        </SkeletonCard>
                    ))}
                </SkeletonGrid>
            </div>
        </div>
    );
}

// Componente Skeleton para Lista
export function SkeletonList({ count = 3 }) {
    return (
        <div>
            {Array.from({ length: count }, (_, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #e9ecef' }}>
                    <SkeletonBox height="50px" width="50px" radius="50%" margin="0 1rem 0 0" />
                    <div style={{ flex: 1 }}>
                        <SkeletonBox height="20px" width="70%" margin="0 0 0.5rem 0" />
                        <SkeletonBox height="16px" width="50%" />
                    </div>
                    <SkeletonBox height="30px" width="80px" />
                </div>
            ))}
        </div>
    );
}

// Componente principal Loading
function Loading({
    type = 'spinner',
    text = 'Carregando...',
    size = '40px',
    color,
    minHeight = '200px',
    count = 1
}) {
    switch (type) {
        case 'skeleton-cards':
            return <SkeletonCardLoader count={count} />;
        case 'skeleton-dashboard':
            return <SkeletonDashboard />;
        case 'skeleton-list':
            return <SkeletonList count={count} />;
        default:
            return <LoadingSpinner size={size} color={color} text={text} minHeight={minHeight} />;
    }
}

export default Loading;
