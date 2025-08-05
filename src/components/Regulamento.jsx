import React, { useState } from 'react';
import styled from 'styled-components';

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  padding: 15px;
  
  @media (max-width: 768px) {
    padding: 10px;
    align-items: flex-start;
    padding-top: 20px;
  }
`;

const Container = styled.div`
  background: white;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    max-height: 95vh;
    max-width: 100%;
  }
  
  @media (max-width: 480px) {
    max-height: 98vh;
  }
`;

const Header = styled.div`
  background: #A91918;
  color: white;
  padding: 20px 25px;
  text-align: center;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    padding: 15px 20px;
  }
  
  h2 {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 600;
    
    @media (max-width: 768px) {
      font-size: 1.2rem;
    }
    
    @media (max-width: 480px) {
      font-size: 1.1rem;
    }
  }
  
  p {
    margin: 8px 0 0 0;
    opacity: 0.9;
    font-size: 0.95rem;
    font-weight: 400;
    
    @media (max-width: 768px) {
      font-size: 0.85rem;
    }
    
    @media (max-width: 480px) {
      font-size: 0.8rem;
    }
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  background: #fafafa;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f5f5f5;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #ccc;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #999;
  }
`;

const Section = styled.div`
  padding: 20px 25px;
  background: white;
  
  @media (max-width: 768px) {
    padding: 15px 20px;
  }
  
  @media (max-width: 480px) {
    padding: 12px 15px;
  }
  
  h3 {
    color: #333;
    font-size: 1.1rem;
    margin: 0 0 15px 0;
    font-weight: 600;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 8px;
    
    @media (max-width: 768px) {
      font-size: 1rem;
      margin-bottom: 12px;
    }
    
    @media (max-width: 480px) {
      font-size: 0.95rem;
      margin-bottom: 10px;
    }
  }
  
  h4 {
    color: #555;
    font-size: 0.95rem;
    margin: 15px 0 8px 0;
    font-weight: 500;
    
    @media (max-width: 768px) {
      font-size: 0.9rem;
      margin: 12px 0 6px 0;
    }
    
    @media (max-width: 480px) {
      font-size: 0.85rem;
      margin: 10px 0 5px 0;
    }
  }
  
  p {
    color: #666;
    line-height: 1.5;
    margin: 0 0 12px 0;
    font-size: 0.9rem;
    text-align: left;
    
    @media (max-width: 768px) {
      font-size: 0.85rem;
      line-height: 1.4;
      margin-bottom: 10px;
    }
    
    @media (max-width: 480px) {
      font-size: 0.8rem;
      margin-bottom: 8px;
    }
  }
  
  ul {
    margin: 0 0 15px 15px;
    
    @media (max-width: 480px) {
      margin-left: 12px;
    }
    
    li {
      color: #666;
      line-height: 1.5;
      margin: 6px 0;
      font-size: 0.9rem;
      
      @media (max-width: 768px) {
        font-size: 0.85rem;
        line-height: 1.4;
        margin: 5px 0;
      }
      
      @media (max-width: 480px) {
        font-size: 0.8rem;
        margin: 4px 0;
      }
    }
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid #f0f0f0;
  }
`;

const Footer = styled.div`
  padding: 20px 25px;
  background: #f8f9fa;
  border-top: 1px solid #e0e0e0;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    padding: 15px 20px;
  }
  
  @media (max-width: 480px) {
    padding: 12px 15px;
  }
`;

const CheckboxContainer = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border: 1px solid #e0e0e0;
  
  @media (max-width: 768px) {
    padding: 12px;
    gap: 10px;
    margin-bottom: 15px;
  }
  
  @media (max-width: 480px) {
    padding: 10px;
    gap: 8px;
    margin-bottom: 12px;
  }
  
  &:hover {
    border-color: #ccc;
  }
  
  input[type="checkbox"] {
    margin: 0;
    margin-top: 2px;
    transform: scale(1.1);
    accent-color: #A91918;
    cursor: pointer;
    flex-shrink: 0;
    
    @media (max-width: 480px) {
      transform: scale(1);
    }
  }
  
  span {
    color: #333;
    line-height: 1.4;
    font-size: 0.9rem;
    font-weight: 400;
    
    @media (max-width: 768px) {
      font-size: 0.85rem;
    }
    
    @media (max-width: 480px) {
      font-size: 0.8rem;
      line-height: 1.3;
    }
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  
  @media (max-width: 480px) {
    flex-direction: column-reverse;
    gap: 10px;
  }
`;

const Button = styled.button`
  padding: 12px 24px;
  border: none;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 120px;
  
  @media (max-width: 768px) {
    padding: 10px 20px;
    font-size: 0.85rem;
    min-width: 100px;
  }
  
  @media (max-width: 480px) {
    width: 100%;
    padding: 12px;
    min-width: auto;
  }
  
  &.primary {
    background: #A91918;
    color: white;
    
    &:hover:not(:disabled) {
      background: #8B1415;
    }
    
    &:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  }
  
  &.secondary {
    background: white;
    color: #666;
    border: 1px solid #ddd;
    
    &:hover {
      background: #f5f5f5;
      border-color: #999;
    }
  }
`;

const Highlight = styled.div`
  background: #f8f9fa;
  padding: 15px;
  border-left: 3px solid #A91918;
  margin: 15px 0;
  
  @media (max-width: 480px) {
    padding: 12px;
    margin: 12px 0;
  }
  
  p {
    margin: 0 !important;
    color: #555 !important;
    font-weight: 500 !important;
    font-size: 0.9rem !important;
    
    @media (max-width: 768px) {
      font-size: 0.85rem !important;
    }
    
    @media (max-width: 480px) {
      font-size: 0.8rem !important;
    }
  }
`;

const ImportantBox = styled.div`
  background: #fff5f5;
  padding: 15px;
  border: 1px solid #fed7d7;
  margin: 15px 0;
  
  @media (max-width: 480px) {
    padding: 12px;
    margin: 12px 0;
  }
  
  p {
    margin: 0 !important;
    color: #c53030 !important;
    font-weight: 500 !important;
    font-size: 0.9rem !important;
    
    @media (max-width: 768px) {
      font-size: 0.85rem !important;
    }
    
    @media (max-width: 480px) {
      font-size: 0.8rem !important;
    }
  }
`;

const LegalNotice = styled.div`
  background: #f7fafc;
  padding: 15px;
  border-left: 3px solid #4a5568;
  margin: 15px 0;
  
  @media (max-width: 480px) {
    padding: 12px;
    margin: 12px 0;
  }
  
  p {
    margin: 0 !important;
    color: #4a5568 !important;
    font-weight: 500 !important;
    font-size: 0.9rem !important;
    font-style: italic !important;
    
    @media (max-width: 768px) {
      font-size: 0.85rem !important;
    }
    
    @media (max-width: 480px) {
      font-size: 0.8rem !important;
    }
  }
`;

export default function Regulamento({ isOpen, onClose, onAccept }) {
    const [accepted, setAccepted] = useState(false);

    if (!isOpen) return null;

    const handleAccept = () => {
        if (accepted) {
            onAccept();
            onClose();
        }
    };

    return (
        <Modal onClick={(e) => e.target === e.currentTarget && onClose()}>
            <Container>

                <Content>
                    <Section>
                        <h3>1. Disposições Gerais</h3>
                        <p>
                            O programa <strong>"Fidelidade da Fast Sistemas Construtivos"</strong> é uma iniciativa da Fast Drywall Franchising Ltda.,
                            pessoa jurídica de direito privado, inscrita no CNPJ sob o nº 40.436.034/0001-48,
                            com sede na Rua Equador, 00043, Bloco 003, Sala 0720, Santo Cristo, Rio de Janeiro/RJ, CEP 20220-410,
                            que tem como objetivo premiar a fidelidade de nossos clientes através do acúmulo de pontos a partir das compras realizadas.
                        </p>

                        <LegalNotice>
                            <p>
                                <strong>IMPORTANTE:</strong> A Fast Drywall Franchising Ltda. reserva-se o direito de alterar,
                                modificar, suspender ou cancelar este programa, bem como suas regras, critérios de pontuação,
                                catálogo de prêmios, prazos e demais condições, a qualquer tempo e sem aviso prévio,
                                conforme sua exclusiva conveniência e oportunidade.
                            </p>
                        </LegalNotice>

                        <Highlight>
                            <p>
                                <strong>Vigência:</strong> Este regulamento entra em vigor a partir de sua publicação
                                e permanece válido por prazo indeterminado. Alterações serão comunicadas através
                                do site oficial e/ou aplicativo do programa.
                            </p>
                        </Highlight>
                    </Section>

                    <Section>
                        <h3>2. Participação no Programa</h3>

                        <h4>2.1 Requisitos para Participação:</h4>
                        <ul>
                            <li>Ser pessoa física maior de 18 anos ou pessoa jurídica regularmente constituída</li>
                            <li>Possuir CPF ou CNPJ válido e em situação regular perante a Receita Federal</li>
                            <li>Ser cliente ativo da Fast Sistemas Construtivos</li>
                            <li>Realizar cadastro completo no sistema Fidelidade da Fast Sistemas Construtivos</li>
                            <li>Aceitar integralmente os termos deste regulamento</li>
                            <li>Fornecer dados pessoais verídicos, completos e atualizados</li>
                        </ul>

                        <h4>2.2 Restrições de Participação:</h4>
                        <ul>
                            <li>Funcionários da Fast Drywall Franchising Ltda. e empresas do grupo</li>
                            <li>Cônjuges, companheiros e parentes até 2º grau dos funcionários</li>
                            <li>Pessoas com restrições cadastrais ou inadimplentes com a empresa</li>
                            <li>Participantes que tenham violado regras em programas anteriores</li>
                        </ul>

                        <ImportantBox>
                            <p>
                                A Fast se reserva o direito de negar ou cancelar a participação de qualquer
                                pessoa no programa, sem necessidade de justificativa, a seu exclusivo critério.
                            </p>
                        </ImportantBox>
                    </Section>

                    <Section>
                        <h3>3. Sistema de Pontuação</h3>

                        <h4>3.1 Geração de Pontos:</h4>
                        <ul>
                            <li>Pontos são gerados exclusivamente através do cadastro de notas fiscais válidas</li>
                            <li>Apenas produtos da linha "Fast" são elegíveis para pontuação</li>
                            <li>A conversão atual é de <strong>R$ 1,00 (um real) = 1 (um) ponto</strong></li>
                            <li>Upload da nota fiscal deve ser realizado em até 30 dias corridos da data da compra</li>
                            <li>Notas fiscais devem estar em nome do participante cadastrado</li>
                        </ul>

                        <LegalNotice>
                            <p>
                                <strong>CLÁUSULA DE ALTERAÇÃO:</strong> A Fast pode, a qualquer momento e a seu exclusivo critério,
                                alterar os critérios de pontuação, incluindo mas não limitando-se a: valor de conversão por real gasto,
                                produtos elegíveis, categorias pontuáveis, limites máximos e mínimos, multiplicadores sazonais,
                                bonificações especiais e qualquer outro aspecto relacionado ao acúmulo de pontos.
                            </p>
                        </LegalNotice>

                        <h4>3.2 Validação e Processamento:</h4>
                        <ul>
                            <li>Todas as notas fiscais passam por validação automática e manual</li>
                            <li>O prazo para processamento é de até 5 dias úteis</li>
                            <li>Notas rejeitadas podem ser reenviadas mediante correção</li>
                            <li>A Fast pode solicitar documentação adicional para validação</li>
                        </ul>

                        <h4>3.3 Validade dos Pontos:</h4>
                        <p>
                            Os pontos acumulados têm validade de <strong>12 (doze) meses</strong> a partir da data
                            de seu crédito na conta do participante. Pontos não utilizados no prazo serão
                            automaticamente cancelados, sem direito a reembolso ou compensação.
                        </p>

                        <ImportantBox>
                            <p>
                                A Fast pode alterar o prazo de validade dos pontos a qualquer momento,
                                aplicando-se aos pontos já acumulados e aos futuros acúmulos.
                            </p>
                        </ImportantBox>
                    </Section>

                    <Section>
                        <h3>4. Catálogo e Resgate de Prêmios</h3>

                        <h4>4.1 Catálogo de Prêmios:</h4>
                        <ul>
                            <li>Os prêmios disponíveis são aqueles constantes no catálogo oficial do programa</li>
                            <li>Disponibilidade sujeita ao estoque existente</li>
                            <li>Valores em pontos podem ser alterados sem aviso prévio</li>
                            <li>Novos prêmios podem ser incluídos e outros removidos a qualquer momento</li>
                        </ul>

                        <LegalNotice>
                            <p>
                                <strong>ALTERAÇÕES NO CATÁLOGO:</strong> A Fast reserva-se o direito de alterar, incluir,
                                excluir, substituir prêmios e modificar valores em pontos necessários para resgate,
                                bem como descontinuar linhas de produtos, a qualquer tempo e sem aviso prévio,
                                conforme disponibilidade comercial e estratégia empresarial.
                            </p>
                        </LegalNotice>

                        <h4>4.2 Processo de Resgate:</h4>
                        <ul>
                            <li>Resgates são realizados exclusivamente através do sistema Fidelidade da Fast Sistemas Construtivos</li>
                            <li>Pontos são debitados imediatamente após confirmação do resgate</li>
                            <li>Não há possibilidade de cancelamento após confirmação</li>
                            <li>Prêmios devem ser retirados em uma loja Fast em até 30 dias corridos</li>
                            <li>É necessário apresentar documento de identidade para retirada</li>
                        </ul>

                        <ImportantBox>
                            <p>
                                Prêmios não retirados no prazo de 30 dias serão automaticamente cancelados.
                                Os pontos utilizados não serão reembolsados em hipótese alguma.
                            </p>
                        </ImportantBox>
                    </Section>

                    <Section>
                        <h3>5. Proteção de Dados e Privacidade</h3>

                        <p>
                            A Fast Drywall Franchising Ltda. compromete-se a proteger e tratar os dados pessoais
                            dos participantes em conformidade com a Lei Geral de Proteção de Dados Pessoais
                            (LGPD - Lei nº 13.709/2018) e demais normas aplicáveis.
                        </p>

                        <h4>5.1 Dados Coletados e Tratados:</h4>
                        <ul>
                            <li>Dados pessoais: nome completo, CPF/CNPJ, RG, telefone, e-mail, endereço</li>
                            <li>Dados de compras: histórico de aquisições, valores gastos, produtos adquiridos</li>
                            <li>Dados de navegação: logs de acesso, preferências, comportamento no sistema</li>
                            <li>Dados de pontuação: acúmulos, resgates, saldos, histórico de transações</li>
                        </ul>

                        <h4>5.2 Finalidades do Tratamento:</h4>
                        <ul>
                            <li>Gestão e operação do programa de fidelidade</li>
                            <li>Comunicação sobre status da conta, promoções e novidades</li>
                            <li>Análises estatísticas e estudos de mercado</li>
                            <li>Prevenção de fraudes e cumprimento de obrigações legais</li>
                            <li>Melhorias na experiência do usuário e desenvolvimento de produtos</li>
                        </ul>

                        <h4>5.3 Direitos do Titular:</h4>
                        <p>
                            O participante possui os direitos previstos na LGPD, incluindo acesso, correção,
                            exclusão, portabilidade e oposição ao tratamento de seus dados pessoais,
                            mediante solicitação através dos canais oficiais de atendimento.
                        </p>
                    </Section>

                    <Section>
                        <h3>6. Regras de Conduta e Anti-Fraude</h3>

                        <h4>6.1 Práticas Expressamente Proibidas:</h4>
                        <ul>
                            <li>Upload de notas fiscais falsas, adulteradas ou de terceiros sem autorização</li>
                            <li>Criação de múltiplas contas para o mesmo CPF/CNPJ</li>
                            <li>Uso de sistemas automatizados, bots ou scripts para acúmulo de pontos</li>
                            <li>Comercialização, transferência ou cessão de pontos entre participantes</li>
                            <li>Tentativas de burlar o sistema de validação</li>
                            <li>Fornecimento de informações falsas ou fraudulentas</li>
                        </ul>

                        <h4>6.2 Medidas de Segurança:</h4>
                        <ul>
                            <li>Monitoramento automático de atividades suspeitas</li>
                            <li>Validação cruzada de dados com bases externas</li>
                            <li>Análise comportamental e padrões de uso</li>
                            <li>Auditoria periódica de contas e transações</li>
                        </ul>

                        <h4>6.3 Penalidades:</h4>
                        <p>
                            O descumprimento das regras estabelecidas neste regulamento poderá resultar,
                            a critério exclusivo da Fast e sem aviso prévio, nas seguintes sanções:
                        </p>
                        <ul>
                            <li>Advertência formal</li>
                            <li>Suspensão temporária da conta (30 a 180 dias)</li>
                            <li>Cancelamento de pontos acumulados indevidamente</li>
                            <li>Exclusão permanente do programa</li>
                            <li>Acionamento judicial para reparação de danos</li>
                        </ul>

                        <ImportantBox>
                            <p>
                                As penalidades aplicadas são definitivas e irreversíveis.
                                Não cabe recurso ou contestação das decisões da Fast.
                            </p>
                        </ImportantBox>
                    </Section>

                    <Section>
                        <h3>7. Disposições Finais e Gerais</h3>

                        <h4>7.1 Alterações do Regulamento:</h4>
                        <p>
                            A Fast reserva-se o direito irrestrito de alterar, modificar, complementar
                            ou revogar este regulamento, total ou parcialmente, a qualquer momento,
                            sem necessidade de aviso prévio ou anuência dos participantes. As alterações
                            entrarão em vigor imediatamente após sua publicação no site oficial.
                        </p>

                        <h4>7.2 Suspensão ou Cancelamento do Programa:</h4>
                        <p>
                            A Fast pode suspender temporariamente ou cancelar definitivamente o programa
                            Fidelidade da Fast Sistemas Construtivos a qualquer momento, por qualquer motivo, a seu exclusivo critério.
                            Em caso de cancelamento, os participantes terão o prazo de 60 dias para utilizar
                            os pontos acumulados, após o qual serão automaticamente cancelados.
                        </p>

                        <h4>7.3 Limitação de Responsabilidade:</h4>
                        <p>
                            A Fast não se responsabiliza por falhas técnicas, interrupções no sistema,
                            perda de dados, problemas de conectividade ou qualquer outro evento que
                            possa prejudicar a participação no programa, sendo sua responsabilidade
                            limitada ao restabelecimento do serviço.
                        </p>

                        <h4>7.4 Atendimento e Suporte:</h4>
                        <p>
                            Dúvidas, reclamações e solicitações relacionadas ao programa devem ser
                            direcionadas exclusivamente através dos canais oficiais:
                        </p>
                        <ul>
                            <li><strong>E-mail:</strong> atendimento@fastsistemasconstrutivos.com.br</li>
                            <li><strong>Telefone:</strong> (21) 99288-2282 (horário comercial)</li>
                            <li><strong>WhatsApp:</strong> (21) 99288-2282</li>
                            <li><strong>Site:</strong> https://fastsistemasconstrutivos.com.br</li>
                        </ul>

                        <h4>7.5 Legislação Aplicável e Foro:</h4>
                        <p>
                            Este regulamento é regido pelas leis brasileiras. Fica eleito o foro da
                            comarca do Rio de Janeiro, Estado do Rio de Janeiro, para dirimir quaisquer
                            controvérsias oriundas da participação no programa, renunciando as partes
                            a qualquer outro, por mais privilegiado que seja.
                        </p>

                        <LegalNotice>
                            <p>
                                <strong>ACEITE:</strong> A participação no programa Fidelidade da Fast Sistemas Construtivos implica
                                na aceitação integral e irrestrita de todos os termos e condições deste regulamento,
                                bem como de suas futuras alterações.
                            </p>
                        </LegalNotice>
                    </Section>
                </Content>

                <Footer>
                    <CheckboxContainer>
                        <input
                            type="checkbox"
                            checked={accepted}
                            onChange={(e) => setAccepted(e.target.checked)}
                        />
                        <span>
                            Li e aceito todos os termos e condições do regulamento do programa
                            Fidelidade da Fast Sistemas Construtivos. Declaro estar ciente das regras de acúmulo e resgate
                            de pontos, bem como das políticas de privacidade e proteção de dados.
                        </span>
                    </CheckboxContainer>

                    <ButtonContainer>
                        <Button className="secondary" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button
                            className="primary"
                            disabled={!accepted}
                            onClick={handleAccept}
                        >
                            Aceitar e Continuar
                        </Button>
                    </ButtonContainer>
                </Footer>
            </Container>
        </Modal>
    );
}
