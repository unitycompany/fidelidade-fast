import React from 'react';
import styled from 'styled-components';
import { FiStar, FiInfo, FiShield } from 'react-icons/fi';

const Container = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 2rem;
  margin: 1rem 0;
  border: 1px solid #dee2e6;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  
  h2 {
    color: #A91918;
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  
  p {
    color: #495057;
    font-size: 1.1rem;
    opacity: 0.9;
  }
`;

const ProdutosList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ProdutoCard = styled.div`
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    border-color: #A91918;
    box-shadow: 0 6px 20px rgba(169, 25, 24, 0.1);
    transform: translateY(-2px);
  }
`;

const ProdutoNome = styled.h3`
  color: #212529;
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  line-height: 1.3;
`;

const ProdutoDescricao = styled.p`
  color: #6c757d;
  font-size: 0.95rem;
  margin-bottom: 1rem;
  line-height: 1.5;
`;

const PontosInfo = styled.div`
  background: linear-gradient(135deg, #A91918 0%, #d63384 100%);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  font-size: 1.1rem;
  
  .points-number {
    font-size: 1.3rem;
    font-weight: 700;
  }
`;

const Categoria = styled.span`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #f8f9fa;
  color: #495057;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid #dee2e6;
`;

const RulesSection = styled.div`
  background: white;
  border-radius: 10px;
  padding: 2rem;
  border: 2px solid #dee2e6;
  margin-top: 2rem;
`;

const RulesHeader = styled.h3`
  color: #A91918;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RulesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  
  li {
    background: #f8f9fa;
    padding: 1rem 1.5rem;
    margin-bottom: 0.75rem;
    border-radius: 8px;
    border-left: 4px solid #A91918;
    font-size: 1rem;
    line-height: 1.6;
    color: #495057;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    strong {
      color: #212529;
      font-weight: 600;
    }
  }
`;

const HighlightBox = styled.div`
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  border: 2px solid #f1c40f;
  border-radius: 10px;
  padding: 1.5rem;
  margin-top: 2rem;
  text-align: center;
  
  .icon {
    font-size: 2rem;
    color: #f39c12;
    margin-bottom: 1rem;
  }
  
  h4 {
    color: #856404;
    font-size: 1.3rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #856404;
    font-size: 1rem;
    margin: 0;
    line-height: 1.6;
  }
`;

// Lista oficial dos 6 produtos elegíveis (sem variações)
const PRODUTOS_OFICIAIS = [
    {
        nome: 'Placa Fast Cimentícia ST',
        descricao: 'Placa cimentícia para uso externo e áreas úmidas',
        pontos: 3,
        categoria: 'Placa ST'
    },
    {
        nome: 'Placa Fast Cimentícia RU',
        descricao: 'Placa cimentícia para uso interno e áreas secas',
        pontos: 3,
        categoria: 'Placa RU'
    },
    {
        nome: 'Placa Glasroc X',
        descricao: 'Placa cimentícia com fibra de vidro para alta resistência',
        pontos: 5,
        categoria: 'Glasroc X'
    },
    {
        nome: 'Placomix',
        descricao: 'Argamassa colante especial para placas cimentícias',
        pontos: 2,
        categoria: 'Argamassa'
    },
    {
        nome: 'Tela Fast',
        descricao: 'Tela de fibra de vidro para reforço de juntas',
        pontos: 4,
        categoria: 'Tela'
    },
    {
        nome: 'Selador Fast',
        descricao: 'Selador primer para preparação de superfícies',
        pontos: 2,
        categoria: 'Selador'
    }
];

const RegrasFastSimples = () => {
    return (
        <Container>
            <Header>
                <h2>
                    <FiStar />
                    Produtos Elegíveis Clube Fast
                </h2>
                <p>Apenas estes 6 produtos oficiais geram pontos no programa de fidelidade</p>
            </Header>

            <ProdutosList>
                {PRODUTOS_OFICIAIS.map((produto, index) => (
                    <ProdutoCard key={index}>
                        <Categoria>{produto.categoria}</Categoria>
                        <ProdutoNome>{produto.nome}</ProdutoNome>
                        <ProdutoDescricao>{produto.descricao}</ProdutoDescricao>
                        <PontosInfo>
                            <span className="points-number">{produto.pontos}</span> pontos por real gasto
                        </PontosInfo>
                    </ProdutoCard>
                ))}
            </ProdutosList>

            <RulesSection>
                <RulesHeader>
                    <FiInfo />
                    Regras do Programa
                </RulesHeader>
                <RulesList>
                    <li>
                        <strong>Produtos Elegíveis:</strong> Apenas os 6 produtos oficiais Fast Sistemas listados acima geram pontos
                    </li>
                    <li>
                        <strong>Cálculo de Pontos:</strong> Os pontos são calculados pelo valor total gasto em cada produto elegível
                    </li>
                    <li>
                        <strong>Multiplicadores:</strong> Cada produto tem seu próprio multiplicador de pontos (de 2x a 5x)
                    </li>
                    <li>
                        <strong>Processamento:</strong> Os pontos são creditados automaticamente após o upload da nota fiscal
                    </li>
                    <li>
                        <strong>Validade:</strong> Os pontos não têm prazo de validade e podem ser usados a qualquer momento
                    </li>
                    <li>
                        <strong>Verificação:</strong> Apenas notas fiscais autênticas com produtos Fast Sistemas são aceitas
                    </li>
                </RulesList>
            </RulesSection>

            <HighlightBox>
                <div className="icon">
                    <FiShield />
                </div>
                <h4>Importante</h4>
                <p>
                    O sistema identifica automaticamente os produtos elegíveis na sua nota fiscal.
                    Variações de código, tamanho ou especificação dos produtos listados também são aceitas,
                    desde que sejam produtos genuínos Fast Sistemas.
                </p>
            </HighlightBox>
        </Container>
    );
};

export default RegrasFastSimples;
