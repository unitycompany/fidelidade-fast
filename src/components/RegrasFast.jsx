import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FiStar, FiAward, FiTarget, FiTrendingUp, FiInfo, FiDollarSign } from 'react-icons/fi';

// Animações
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`;

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #f8f9fa 100%);
  padding: 2rem;
  font-family: 'Montserrat', sans-serif;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  animation: ${fadeInUp} 0.6s ease-out;
`;

const Title = styled.h1`
  color: #A91918;
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
  font-family: 'Urbanist', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    font-size: 2.2rem;
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 1.3rem;
  margin-bottom: 2rem;
  font-weight: 500;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const IntroSection = styled.div`
  background: linear-gradient(135deg, #A91918, #8b1510);
  color: white;
  padding: 3rem;
  border-radius: 20px;
  margin-bottom: 3rem;
  text-align: center;
  animation: ${fadeInUp} 0.6s ease-out 0.2s both;
  
  h2 {
    font-size: 2rem;
    margin-bottom: 1.5rem;
    font-family: 'Urbanist', sans-serif;
  }
  
  p {
    font-size: 1.1rem;
    line-height: 1.6;
    opacity: 0.95;
  }
  
  @media (max-width: 768px) {
    padding: 2rem;
    
    h2 {
      font-size: 1.6rem;
    }
    
    p {
      font-size: 1rem;
    }
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
  animation: ${fadeInUp} 0.6s ease-out 0.4s both;
`;

const ProductCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border-left: 5px solid ${props => props.color};
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    animation: ${pulse} 0.6s ease-in-out;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 60px;
    height: 60px;
    background: ${props => props.color};
    opacity: 0.1;
    border-radius: 0 16px 0 100%;
  }
`;

const ProductHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const ProductName = styled.h3`
  color: #353535;
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0;
  font-family: 'Urbanist', sans-serif;
`;

const PointsBadge = styled.div`
  background: ${props => props.color};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-weight: bold;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  box-shadow: 0 4px 12px ${props => props.color}40;
`;

const ProductDescription = styled.p`
  color: #666;
  line-height: 1.6;
  margin: 0;
`;

const PointsExplanation = styled.div`
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 1rem;
  margin-top: 1rem;
  
  .points-calc {
    color: #A91918;
    font-weight: 600;
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .example {
    color: #666;
    font-size: 0.9rem;
    font-style: italic;
  }
`;

const InfoSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  animation: ${fadeInUp} 0.6s ease-out 0.6s both;
  
  h3 {
    color: #A91918;
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    font-family: 'Urbanist', sans-serif;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  ul {
    list-style: none;
    padding: 0;
    
    li {
      color: #666;
      line-height: 1.8;
      margin-bottom: 0.8rem;
      position: relative;
      padding-left: 1.5rem;
      
      &:before {
        content: '✓';
        position: absolute;
        left: 0;
        color: #28a745;
        font-weight: bold;
      }
    }
  }
`;

const HighlightBox = styled.div`
  background: linear-gradient(135deg, #fff3cd, #ffeaa7);
  border: 2px solid #ffc107;
  border-radius: 12px;
  padding: 1.5rem;
  margin: 2rem 0;
  
  .highlight-title {
    color: #856404;
    font-weight: bold;
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .highlight-text {
    color: #856404;
    line-height: 1.6;
  }
`;

const RegrasFast = ({ showAsSection = false }) => {
    const produtos = [
        {
            nome: "Placa ST",
            pontos: "0,5 ponto",
            cor: "#6c757d",
            descricao: "Placas standard para drywall. Produtos de baixa margem geram menos pontos."
        },
        {
            nome: "Placa RU",
            pontos: "1 ponto",
            cor: "#007bff",
            descricao: "Placas resistentes à umidade. Pontuação padrão do programa."
        },
        {
            nome: "Placa Glasroc X",
            pontos: "2 pontos",
            cor: "#dc3545",
            descricao: "Placas cimentícias para áreas úmidas. Produto estratégico de valor agregado."
        },
        {
            nome: "Placomix",
            pontos: "1 ponto",
            cor: "#6610f2",
            descricao: "Massa para rejunte e acabamento. Pontuação padrão do programa."
        },
        {
            nome: "Malha telada para Glasroc X",
            pontos: "2 pontos",
            cor: "#e83e8c",
            descricao: "Malha específica para uso com Glasroc X. Produto estratégico de valor agregado."
        },
        {
            nome: "Basecoat (massa para Glasroc X)",
            pontos: "2 pontos",
            cor: "#dc3545",
            descricao: "Massa base específica para Glasroc X. Produto estratégico de valor agregado."
        }
    ];

    const content = (
        <>
            <Header>
                <Title>
                    <FiStar />
                    Clube Fast de Recompensas
                </Title>
                <Subtitle>Valorize cada compra. Transforme pontos em conquistas.</Subtitle>
            </Header>

            <MainContent>
                <IntroSection>
                    <h2>🔷 O que é o Clube Fast de Recompensas?</h2>
                    <p>
                        O programa de fidelidade da Fast Sistemas Construtivos criado para valorizar a jornada dos nossos clientes —
                        sejam eles construtores, consumidores finais, franqueados, compradores do atacado ou do varejo.
                    </p>
                    <p>
                        <strong>A cada R$ 1,00 em compras, o cliente acumula pontos conforme a categoria do produto.</strong>
                    </p>
                </IntroSection>

                <ProductsGrid>
                    {produtos.map((produto, index) => (
                        <ProductCard key={index} color={produto.cor}>
                            <ProductHeader>
                                <ProductName>{produto.nome}</ProductName>
                                <PointsBadge color={produto.cor}>
                                    <FiTarget />
                                    {produto.pontos}
                                </PointsBadge>
                            </ProductHeader>
                            <ProductDescription>{produto.descricao}</ProductDescription>
                            <PointsExplanation>
                                <div className="points-calc">
                                    <FiDollarSign />
                                    {produto.pontos} por R$ 1,00
                                </div>
                                <div className="example">
                                    Exemplo: R$ 100,00 = {produto.pontos === "0,5 ponto" ? "50" : produto.pontos === "1 ponto" ? "100" : "200"} pontos
                                </div>
                            </PointsExplanation>
                        </ProductCard>
                    ))}
                </ProductsGrid>

                <InfoSection>
                    <h3>
                        <FiInfo />
                        Como Funciona?
                    </h3>
                    <ul>
                        <li>A cada R$ 1,00 em compras, o cliente acumula pontos conforme a categoria do produto</li>
                        <li>Os pontos ficam disponíveis na conta do cliente e podem ser consultados a qualquer momento</li>
                        <li>Ao atingir a pontuação necessária, o cliente poderá resgatar prêmios via plataforma digital</li>
                        <li>O saldo de pontos possui validade de 12 meses a partir da data da compra</li>
                    </ul>
                </InfoSection>

                <HighlightBox>
                    <div className="highlight-title">
                        <FiTrendingUp />
                        Estratégia de Pontuação
                    </div>
                    <div className="highlight-text">
                        <strong>Produtos de baixa margem geram menos pontos.</strong>
                        Produtos estratégicos e de valor agregado (como Glasroc X e seus acessórios) acumulam mais pontos,
                        incentivando a venda de produtos de maior rentabilidade.
                    </div>
                </HighlightBox>

                <InfoSection>
                    <h3>
                        <FiAward />
                        Regras Gerais
                    </h3>
                    <ul>
                        <li>Programa válido para CNPJs e CPFs ativos no cadastro Fast</li>
                        <li>A pontuação é individual e intransferível</li>
                        <li>Compras com descontos promocionais especiais podem gerar pontuação reduzida</li>
                        <li>O resgate está sujeito à disponibilidade do prêmio no estoque</li>
                        <li>Acesso a campanhas exclusivas com bonificação turbinada em períodos especiais</li>
                    </ul>
                </InfoSection>
            </MainContent>
        </>
    );

    return showAsSection ? (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {content}
        </div>
    ) : (
        <Container>
            {content}
        </Container>
    );
};

export default RegrasFast;
