import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FiStar, FiAward, FiTrendingUp, FiInfo, FiPackage, FiCalendar, FiUsers, FiGift } from 'react-icons/fi';

// Animações
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

// Styled Components
const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Montserrat', sans-serif;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  min-height: 100vh;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #A91918, #8B1510);
  color: white;
  padding: 3rem 2rem;
  border-radius: 20px;
  margin-bottom: 3rem;
  text-align: center;
  animation: ${fadeInUp} 0.8s ease-out;
  
  h1 {
    font-family: 'Urbanist', sans-serif;
    font-size: 2.5rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }
  
  .subtitle {
    font-size: 1.3rem;
    opacity: 0.9;
    margin: 0;
    font-style: italic;
  }
  
  @media (max-width: 768px) {
    h1 {
      font-size: 2rem;
    }
    .subtitle {
      font-size: 1.1rem;
    }
  }
`;

const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const Section = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  animation: ${fadeInUp} 0.6s ease-out;
  animation-delay: ${props => props.delay || 0}s;
  animation-fill-mode: both;
  border-left: 5px solid ${props => props.color || '#A91918'};
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
  }
  
  h2 {
    color: #353535;
    font-family: 'Urbanist', sans-serif;
    font-size: 1.5rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  p {
    color: #666;
    line-height: 1.6;
    margin-bottom: 1rem;
  }
`;

const PontuacaoTable = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  animation: ${slideIn} 0.8s ease-out;
  
  .table-header {
    background: linear-gradient(135deg, #A91918, #8B1510);
    color: white;
    padding: 1.5rem;
    text-align: center;
    
    h3 {
      margin: 0;
      font-family: 'Urbanist', sans-serif;
      font-size: 1.3rem;
    }
  }
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #f8f9fa;
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  .produto {
    font-weight: 600;
    color: #353535;
  }
  
  .pontos {
    text-align: right;
    font-weight: bold;
    color: #A91918;
    font-size: 1.1rem;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    
    .pontos {
      text-align: left;
    }
  }
`;

const PremiosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const PremioCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
  transition: all 0.3s ease;
  animation: ${fadeInUp} 0.6s ease-out;
  animation-delay: ${props => props.delay || 0}s;
  animation-fill-mode: both;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
  
  .premio-icon {
    font-size: 2rem;
    color: #A91918;
    margin-bottom: 1rem;
  }
  
  .premio-nome {
    font-weight: bold;
    color: #353535;
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
  }
  
  .premio-valor {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }
  
  .premio-pontos {
    background: linear-gradient(135deg, #A91918, #8B1510);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-weight: bold;
    display: inline-block;
    margin-top: 0.5rem;
  }
`;

const RulesList = styled.ul`
  list-style: none;
  padding: 0;
  
  li {
    padding: 0.75rem 0;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    
    &:last-child {
      border-bottom: none;
    }
    
    .icon {
      color: #A91918;
      margin-top: 0.2rem;
      flex-shrink: 0;
    }
    
    .text {
      color: #666;
      line-height: 1.5;
    }
  }
`;

const BenefitsList = styled.div`
  display: grid;
  gap: 1rem;
  
  .benefit {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 8px;
    border-left: 3px solid #28a745;
    
    .title {
      font-weight: 600;
      color: #353535;
      margin-bottom: 0.25rem;
    }
    
    .description {
      color: #666;
      font-size: 0.9rem;
    }
  }
`;

function ClubeFastRegras() {
    const produtosPontuacao = [
        { produto: 'Placa ST', pontos: '0,5 ponto' },
        { produto: 'Placa RU', pontos: '1 ponto' },
        { produto: 'Placomix', pontos: '1 ponto' },
        { produto: 'Placa Glasroc X', pontos: '2 pontos' },
        { produto: 'Malha telada para Glasroc X', pontos: '2 pontos' },
        { produto: 'Basecoat (massa para Glasroc X)', pontos: '2 pontos' }
    ];

    const premiosIniciais = [
        { nome: 'Nível Laser', valor: 'R$ 500', pontos: '10.000 pontos', delay: 0.1 },
        { nome: 'Parafusadeira', valor: 'R$ 300', pontos: '5.000 pontos', delay: 0.2 },
        { nome: 'Trena Digital', valor: 'R$ 200', pontos: '3.000 pontos', delay: 0.3 },
        { nome: 'Kit Brocas SDS', valor: 'R$ 80', pontos: '1.500 pontos', delay: 0.4 },
        { nome: 'Vale-compras Fast', valor: 'R$ 100', pontos: '2.000 pontos', delay: 0.5 },
        { nome: 'Camiseta Fast', valor: 'R$ 50', pontos: '1.000 pontos', delay: 0.6 },
        { nome: 'Boné Fast', valor: 'R$ 40', pontos: '800 pontos', delay: 0.7 }
    ];

    return (
        <Container>
            <Header>
                <h1>
                    <FiStar />
                    Clube Fast de Recompensas
                </h1>
                <p className="subtitle">Valorize cada compra. Transforme pontos em conquistas.</p>
            </Header>

            <SectionGrid>
                <Section color="#007bff" delay={0.1}>
                    <h2>
                        <FiInfo />
                        O que é o Clube Fast?
                    </h2>
                    <p>
                        O Clube Fast de Recompensas é o programa de fidelidade da Fast Sistemas Construtivos,
                        criado para valorizar a jornada dos nossos clientes — sejam eles construtores,
                        consumidores finais, franqueados, compradores do atacado ou do varejo.
                    </p>
                    <p>
                        A cada compra de produtos Fast, o cliente acumula pontos e pode trocá-los por
                        brindes, ferramentas profissionais, materiais e prêmios exclusivos.
                    </p>
                </Section>

                <Section color="#28a745" delay={0.2}>
                    <h2>
                        <FiTrendingUp />
                        Como Funciona?
                    </h2>
                    <RulesList>
                        <li>
                            <FiStar className="icon" />
                            <span className="text">A cada R$ 1,00 em compras, o cliente acumula pontos conforme a categoria do produto</span>
                        </li>
                        <li>
                            <FiPackage className="icon" />
                            <span className="text">Os pontos ficam disponíveis na conta do cliente e podem ser consultados a qualquer momento</span>
                        </li>
                        <li>
                            <FiGift className="icon" />
                            <span className="text">Ao atingir a pontuação necessária, o cliente poderá resgatar prêmios via plataforma digital</span>
                        </li>
                        <li>
                            <FiCalendar className="icon" />
                            <span className="text">O saldo de pontos possui validade de 12 meses a partir da data da compra</span>
                        </li>
                    </RulesList>
                </Section>
            </SectionGrid>

            <PontuacaoTable>
                <div className="table-header">
                    <h3>📊 Pontuação por Produto</h3>
                </div>
                {produtosPontuacao.map((item, index) => (
                    <TableRow key={index}>
                        <div className="produto">{item.produto}</div>
                        <div className="pontos">{item.pontos} por R$ 1,00</div>
                    </TableRow>
                ))}
                <div style={{ padding: '1rem 1.5rem', background: '#f8f9fa', fontSize: '0.9rem', color: '#666' }}>
                    * Produtos de baixa margem geram menos pontos. Produtos estratégicos e de valor agregado acumulam mais.
                </div>
            </PontuacaoTable>

            <Section color="#dc3545" delay={0.3}>
                <h2>
                    <FiAward />
                    Catálogo de Prêmios Iniciais
                </h2>
                <PremiosGrid>
                    {premiosIniciais.map((premio, index) => (
                        <PremioCard key={index} delay={premio.delay}>
                            <div className="premio-icon">🎁</div>
                            <div className="premio-nome">{premio.nome}</div>
                            <div className="premio-valor">{premio.valor}</div>
                            <div className="premio-pontos">{premio.pontos}</div>
                        </PremioCard>
                    ))}
                </PremiosGrid>
                <p style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                    Os prêmios poderão ser atualizados ou ampliados de acordo com campanhas promocionais.
                </p>
            </Section>

            <SectionGrid>
                <Section color="#17a2b8" delay={0.4}>
                    <h2>
                        <FiUsers />
                        Regras Gerais
                    </h2>
                    <RulesList>
                        <li>
                            <FiInfo className="icon" />
                            <span className="text">Programa válido para CNPJs e CPFs ativos no cadastro Fast</span>
                        </li>
                        <li>
                            <FiUsers className="icon" />
                            <span className="text">A pontuação é individual e intransferível</span>
                        </li>
                        <li>
                            <FiTrendingUp className="icon" />
                            <span className="text">Compras com descontos especiais podem gerar pontuação reduzida</span>
                        </li>
                        <li>
                            <FiPackage className="icon" />
                            <span className="text">O resgate está sujeito à disponibilidade do prêmio no estoque</span>
                        </li>
                    </RulesList>
                </Section>

                <Section color="#ffc107" delay={0.5}>
                    <h2>
                        <FiGift />
                        Benefícios
                    </h2>
                    <BenefitsList>
                        <div className="benefit">
                            <div className="title">Reconhecimento da Fidelidade</div>
                            <div className="description">Valorização dos clientes mais engajados com a marca</div>
                        </div>
                        <div className="benefit">
                            <div className="title">Estímulo a Produtos Premium</div>
                            <div className="description">Incentivo à compra de produtos de maior valor agregado</div>
                        </div>
                        <div className="benefit">
                            <div className="title">Ferramentas sem Custo</div>
                            <div className="description">Possibilidade de conquistar ferramentas e materiais gratuitamente</div>
                        </div>
                        <div className="benefit">
                            <div className="title">Campanhas Exclusivas</div>
                            <div className="description">Acesso a promoções com bonificação turbinada</div>
                        </div>
                    </BenefitsList>
                </Section>
            </SectionGrid>

            <Section color="#6f42c1" delay={0.6}>
                <h2>
                    <FiCalendar />
                    Lançamento e Divulgação
                </h2>
                <p>
                    O programa será divulgado via vendedores, materiais de PDV, redes sociais,
                    e-mail marketing e QR Codes nos produtos.
                </p>
                <p>
                    Haverá uma plataforma digital integrada ao CRM para visualização de pontos,
                    histórico de compras e resgates.
                </p>
                <div style={{
                    background: 'linear-gradient(135deg, #A91918, #8B1510)',
                    color: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    textAlign: 'center',
                    marginTop: '1.5rem'
                }}>
                    <strong>🚀 Sistema já implementado e funcionando!</strong>
                    <br />
                    <span style={{ fontSize: '0.9rem', opacity: '0.9' }}>
                        Faça upload de suas notas fiscais e comece a acumular pontos agora mesmo!
                    </span>
                </div>
            </Section>
        </Container>
    );
}

export default ClubeFastRegras;
