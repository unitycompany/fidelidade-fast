import React, { useState } from 'react';
import styled from 'styled-components';
import { FiSearch, FiInfo, FiFileText, FiAlertCircle } from 'react-icons/fi';
import sapService from '../services/sapService';

/**
 * Componente para entrada manual do número da nota fiscal
 * Permite consultar informações diretamente pelo número da NF-e
 */
const NotaFiscalInput = ({ onNotaProcessada, clienteId }) => {
  const [numeroNota, setNumeroNota] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultado, setResultado] = useState(null);
  const [mostraPrevisualizacao, setMostraPrevisualizacao] = useState(true);
  const [pontosCreditados, setPontosCreditados] = useState(false);

  // Função para processar a consulta pelo número da nota fiscal
  const handleConsultaNota = async () => {
    if (!numeroNota || numeroNota.length < 6) {
      setError('Digite um número de nota fiscal válido');
      return;
    }

    setLoading(true);
    setError('');
    setPontosCreditados(false);
    
    try {
      // Consultar no serviço SAP
      const resultadoConsulta = await sapService.consultarNotaFiscalPorNumero(numeroNota);
      
      if (!resultadoConsulta.success) {
        throw new Error(resultadoConsulta.error || 'Erro ao consultar nota fiscal');
      }

      // Armazenar o resultado para exibição
      setResultado(resultadoConsulta.data);

      // Notificar o componente pai (opcional)
      if (onNotaProcessada) {
        onNotaProcessada(resultadoConsulta.data);
      }

    } catch (err) {
      console.error('Erro ao processar nota fiscal:', err);
      setError(err.message || 'Erro ao processar a consulta');
      setResultado(null);
    } finally {
      setLoading(false);
    }
  };

  // Função para atribuir pontos após confirmação do usuário
  const handleAtribuirPontos = async () => {
    if (!clienteId || !resultado) {
      setError('Não foi possível atribuir pontos. Informações incompletas.');
      return;
    }

    setLoading(true);
    
    try {
      // Chamar o serviço para atribuir pontos
      const atribuicaoResult = await sapService.atribuirPontosCliente(clienteId, resultado);
      
      if (!atribuicaoResult.success) {
        throw new Error(atribuicaoResult.error || 'Falha ao creditar os pontos');
      }

      // Exibir confirmação
      setPontosCreditados(true);
      
    } catch (err) {
      console.error('Erro ao atribuir pontos:', err);
      setError(err.message || 'Falha ao creditar os pontos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>Consulta por Número da NF-e</Title>
      
      {/* Entrada do número da nota */}
      <InputGroup>
        <StyledInput
          type="text"
          value={numeroNota}
          onChange={(e) => setNumeroNota(e.target.value.trim())}
          placeholder="Digite o número da nota fiscal"
          disabled={loading}
        />
        <SearchButton onClick={handleConsultaNota} disabled={loading || !numeroNota}>
          {loading ? <LoadingSpinner /> : <FiSearch />}
          {loading ? 'Consultando...' : 'Consultar'}
        </SearchButton>
      </InputGroup>

      {/* Mensagem de erro */}
      {error && (
        <ErrorMessage>
          <FiAlertCircle /> {error}
        </ErrorMessage>
      )}

      {/* Previsualização de onde encontrar o número */}
      {mostraPrevisualizacao && !resultado && !loading && (
        <PreviewSection>
          <PreviewTitle>
            <FiInfo /> Onde encontrar o número da nota fiscal?
          </PreviewTitle>
          <PreviewContent>
            <PreviewImage>
              <img src="/nota-fiscal-exemplo.png" alt="Exemplo de nota fiscal" />
              <Highlight>
                <span>Número da Nota</span>
              </Highlight>
            </PreviewImage>
            <PreviewText>
              <p>O número da Nota Fiscal normalmente está localizado no topo do documento, mais a direita.</p><br/>
              <p>É um número com cerca de 6 dígitos, como por exemplo: <strong>059234</strong></p>
            </PreviewText>
          </PreviewContent>
          <CloseButton onClick={() => setMostraPrevisualizacao(false)}>
            Fechar dica
          </CloseButton>
        </PreviewSection>
      )}

      {/* Resultado da consulta */}
      {resultado && (
        <ResultContainer>
          <ResultHeader>
            <FiFileText /> Nota Fiscal Encontrada
          </ResultHeader>
          
          <ResultContent>
            <ResultItem>
              <strong>Número da NF-e:</strong> {resultado.numero}
            </ResultItem>
            <ResultItem>
              <strong>Data de Emissão:</strong> {resultado.dataEmissao}
            </ResultItem>
            <ResultItem>
              <strong>Fornecedor:</strong> {resultado.fornecedor?.nome}
            </ResultItem>
            <ResultItem>
              <strong>Valor Total:</strong> R$ {parseFloat(resultado.valorTotal).toFixed(2).replace('.', ',')}
            </ResultItem>
            <ResultItem highlight>
              <strong>Pontos a Receber:</strong> {resultado.pontos} pontos
            </ResultItem>
          </ResultContent>

          {/* Produtos na nota (se disponíveis) */}
          {resultado.produtos && resultado.produtos.length > 0 && (
            <ProductsSection>
              <h4>Produtos Identificados</h4>
              <ProductTable>
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th>Valor</th>
                    <th>Pontos</th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.produtos.map((produto, index) => (
                    <tr key={index}>
                      <td>{produto.descricao}</td>
                      <td>R$ {parseFloat(produto.valor).toFixed(2).replace('.', ',')}</td>
                      <td>{produto.pontos || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </ProductTable>
            </ProductsSection>
          )}

          {/* Botão para creditar os pontos */}
          {!pontosCreditados ? (
            <ActionButton onClick={handleAtribuirPontos} disabled={loading}>
              {loading ? <LoadingSpinner /> : null}
              Creditar {resultado.pontos} pontos na minha conta
            </ActionButton>
          ) : (
            <SuccessMessage>
              <FiInfo /> {resultado.pontos} pontos foram creditados com sucesso!
            </SuccessMessage>
          )}
        </ResultContainer>
      )}
    </Container>
  );
};

// Estilos
const Container = styled.div`
  background: #fff;
  width: 100%;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #A91918;
  font-weight: 500;
`;

const InputGroup = styled.div`
  display: flex;
  margin-bottom: 1rem;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const StyledInput = styled.input`
  flex: 1;
  padding: 0.8rem 1rem;
  font-size: 1rem;
  border: 1px solid #e2e8f0;
  outline: none;

  &:focus {
    outline: none;
    border-color: none;
  }

  &:disabled {
    background-color: #f7fafc;
    cursor: not-allowed;
  }

  @media (max-width: 640px) {
    margin-bottom: 0.5rem;
  }
`;

const SearchButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: #A91918;
  color: white;
  border: none;
  padding: 0 1.5rem;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background-color: #8B0000;
  }

  &:disabled {
    background-color: #D3D3D3;
    cursor: not-allowed;
  }

  @media (max-width: 640px) {
    padding: 0.8rem;
  }
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorMessage = styled.div`
  color: #A91918;
  background-color: #f8f8f8;
  padding: 0.8rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #eaeaea;
`;

const PreviewSection = styled.div`
  background-color: #f9f9f9;
  padding: 1rem;
  margin-top: 1rem;
  border: 1px solid #eaeaea;
`;

const PreviewTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  color: #A91918;
  margin-bottom: 1rem;
`;

const PreviewContent = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const PreviewImage = styled.div`
  position: relative;
  flex: 1;
  max-width: 100%;
  
  img {
    width: 100%;
    height: 250px;
    object-fit: cover;
    object-position: right;
    border: 1px solid #eaeaea;
  }
`;

const Highlight = styled.div`
  position: absolute;
  top: -10px;
  right: 0px;
  background-color: rgba(169, 25, 24, 0.8);
  color: white;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: bold;
  
  &:before {
    content: '';
    position: absolute;
    left: 50%;
    bottom: -5px;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid rgba(169, 25, 24, 0.8);
  }
`;

const PreviewText = styled.div`
  flex: 2;
  font-size: 0.9rem;
  
  p {
    margin-bottom: 0.5rem;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #A91918;
  font-size: 0.9rem;
  padding: 0.5rem;
  cursor: pointer;
  text-decoration: underline;
  display: block;
  margin-left: auto;
  margin-top: 1rem;
  
  &:hover {
    color: #8B0000;
  }
`;

const ResultContainer = styled.div`
  margin-top: 1rem;
  border: 1px solid #e2e8f0;
  overflow: hidden;
`;

const ResultHeader = styled.div`
  background-color: #A91918;
  color: white;
  padding: 0.8rem 1rem;
  font-size: 1.1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ResultContent = styled.div`
  padding: 1rem;
`;

const ResultItem = styled.div`
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
  
  ${props => props.highlight && `
    font-size: 1.1rem;
    color: #A91918;
    font-weight: 500;
    margin-top: 0.5rem;
  `}
`;

const ProductsSection = styled.div`
  padding: 1rem;
  border-top: 1px solid #e2e8f0;
  
  h4 {
    margin-bottom: 0.8rem;
    color: #A91918;
    font-size: 1rem;
  }
`;

const ProductTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  
  th, td {
    padding: 0.5rem;
    text-align: left;
    border-bottom: 1px solid #f0f0f0;
  }
  
  th {
    background-color: #f9f9f9;
    color: #A91918;
    font-weight: 500;
  }
  
  tr:last-child td {
    border-bottom: none;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 0.8rem;
  background-color: #A91918;
  color: white;
  border: none;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #8B0000;
  }
  
  &:disabled {
    background-color: #D3D3D3;
    cursor: not-allowed;
  }
`;

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #f0f0f0;
  color: #A91918;
  padding: 0.8rem;
  font-weight: 500;
`;

export default NotaFiscalInput;
