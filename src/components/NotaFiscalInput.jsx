import React, { useState } from 'react';
import styled from 'styled-components';
import { FiSearch, FiInfo, FiFileText, FiAlertCircle } from 'react-icons/fi';
import { addPointsToCustomer } from '../services/supabase';
import imagemNotaFiscalService from '../services/imagemNotaFiscalService';
import { buildClientePayload } from '../utils/customer';

/**
 * Componente para entrada manual do número da nota fiscal
 * Permite consultar informações diretamente pelo número da NF-e
 */
const NotaFiscalInput = ({ onNotaProcessada, clienteId, user }) => {
  const [numeroNota, setNumeroNota] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultado, setResultado] = useState(null);
  const [mostraPrevisualizacao, setMostraPrevisualizacao] = useState(true);
  const [pontosCreditados, setPontosCreditados] = useState(false);

  // Função para enviar apenas o número ao webhook n8n e obter pontos
  const handleConsultaNota = async () => {
    if (!numeroNota || numeroNota.length < 6) {
      setError('Digite um número de nota fiscal válido');
      return;
    }

  setLoading(true);
    setError('');
    setPontosCreditados(false);
    
    try {
      // Preparar dados para envio (só com número da NF-e)
      const payload = {
        source: 'sistema-de-fidelidade-web',
        timestamp: new Date().toISOString(),
        numeroNota: numeroNota,
        origem: 'input_numero',
        clienteId: clienteId,
        cliente: buildClientePayload(user)
      };

      console.log('Enviando número da NF-e para n8n:', {
        url: 'https://n8n.unitycompany.com.br/webhook/sistema-de-fidelidade',
        numeroNota: numeroNota,
        cnpj_enviado: payload?.cliente?.cnpj
      });

      // Enviar para o webhook do n8n com timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos
      
      const response = await fetch('https://n8n.unitycompany.com.br/webhook/sistema-de-fidelidade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      let n8nResponse = {};
      
      if (!response.ok) {
        console.error(`Erro HTTP ${response.status} do n8n:`, response.statusText);
        
        // Tentar ler a resposta de erro
        try {
          const errorText = await response.text();
          console.error('Resposta de erro completa do n8n:', errorText);
        } catch (e) {
          console.error('Não foi possível ler a resposta de erro:', e);
        }
        setError('Não foi possível consultar sua nota agora. Tente novamente em alguns minutos.');
        return;
      } else {
        try {
          n8nResponse = await response.json();
          console.log('Resposta válida do n8n para número da nota:', n8nResponse);
        } catch (jsonError) {
          console.error('Erro ao fazer parse do JSON da resposta:', jsonError);
          setError('Não conseguimos interpretar a resposta. Tente novamente.');
          return;
        }
      }

      // Processar resposta do n8n (mesmo padrão do upload)
      let pontosCalculados = 0;
      let dadosNotaParaSalvar = null;
      
      // Normalização: mapear campos novos do n8n para manter compatibilidade
      if (Array.isArray(n8nResponse)) {
        n8nResponse = n8nResponse.map(item => (
          (item && typeof item === 'object')
            ? {
                ...item,
                ...(item['nf-e'] && !item.nota ? { nota: item['nf-e'] } : {}),
                ...(item['data-emissao'] && !item.data_emissao ? { data_emissao: item['data-emissao'] } : {})
              }
            : item
        ));
      } else if (n8nResponse && typeof n8nResponse === 'object') {
        const extra = {};
        if (n8nResponse['nf-e'] && !n8nResponse.nota) extra.nota = n8nResponse['nf-e'];
        if (n8nResponse['data-emissao'] && !n8nResponse.data_emissao) extra.data_emissao = n8nResponse['data-emissao'];
        if (Object.keys(extra).length) n8nResponse = { ...n8nResponse, ...extra };
      }
      
      console.log('🔍 [INPUT MANUAL] Resposta recebida:', {
        tipo: Array.isArray(n8nResponse) ? 'array' : typeof n8nResponse,
        conteudo: n8nResponse
      });
      
      if (Array.isArray(n8nResponse) && n8nResponse.length > 0) {
        // Se é um array, pegar o primeiro elemento
        const resultado = n8nResponse[0];
        console.log('🔍 [INPUT MANUAL] Processando resultado do array n8n:', resultado);
        
        // Nota não pertence ao usuário
        if (resultado.nota && /nao pertence a voce|não pertence a você/i.test(resultado.nota)) {
          const digits = (resultado.nota.match(/\d+/g) || []).join('');
          const docHint = digits.substring(0, 5);
          setError(`Esta nota fiscal não pertence à sua conta. Verifique no seu Perfil se CPF e CNPJ estão cadastrados corretamente. Documento relacionado à nota inicia com: ${docHint || '*****'}.`);
          return;
        }

        if (resultado.status === 'sucesso' && resultado.pontuacao_total) {
          pontosCalculados = Number(resultado.pontuacao_total);
          dadosNotaParaSalvar = resultado;
          console.log(`✅ [INPUT MANUAL] Pontos extraídos do n8n (array): ${pontosCalculados}`);
        } else {
          console.warn('⚠️ [INPUT MANUAL] Resultado do n8n sem pontuacao_total válida:', resultado);
        }
      } else if (n8nResponse && typeof n8nResponse === 'object') {
        // Erro genérico
        if (n8nResponse.erro) {
          setError('Houve um erro ao consultar sua nota. Revise o número e tente novamente.');
          return;
        }
        // Nota usada
        if (n8nResponse.nota === 'A nota fiscal enviada já foi usada.') {
          setError('Esta nota fiscal já foi usada anteriormente. Pela regulamentação, não é permitido enviar a mesma nota mais de uma vez.');
          return;
        }
        // Data maior que 90 dias
        if (n8nResponse.date && /90\s*dias/i.test(n8nResponse.date)) {
          setError('A data desta nota fiscal excedeu o limite de 90 dias, conforme nossa regulamentação.');
          return;
        }
        // Se é objeto direto, tentar diferentes propriedades
        pontosCalculados = Number(n8nResponse.pontuacao_total) || 
                          Number(n8nResponse.pontos) || 
                          Number(n8nResponse.points) || 0;
        dadosNotaParaSalvar = n8nResponse;
        console.log(`✅ [INPUT MANUAL] Pontos extraídos do n8n (objeto): ${pontosCalculados}`);
      } else {
        console.warn('⚠️ [INPUT MANUAL] Resposta do n8n não é array nem objeto válido:', n8nResponse);
        setError('Resposta inválida do servidor. Tente novamente.');
        return;
      }

      const pontos = pontosCalculados;
      setResultado({ numero: numeroNota, valorTotal: 0, pontos, produtos: [] });

      // Verificar erros específicos do n8n
      if (n8nResponse && typeof n8nResponse === 'object') {
        // Verificar erro de nota já usada
        if (n8nResponse.nota === "A nota fiscal enviada já foi usada.") {
          setError('Esta nota fiscal já foi processada anteriormente.');
          return;
        }
        
        // Verificar erro de data limite (90 dias)
        if (n8nResponse.date && /90\s*dias/i.test(n8nResponse.date)) {
          setError('A data desta nota fiscal excedeu o limite de 90 dias, conforme nossa regulamentação.');
          return;
        }
      }
      
      // Verificar erros no array também
      if (Array.isArray(n8nResponse) && n8nResponse.length > 0) {
        const resultado = n8nResponse[0];
        if (resultado.nota === "A nota fiscal enviada já foi usada.") {
          setError('Esta nota fiscal já foi processada anteriormente.');
          return;
        }
        
        if (resultado.date === "A data da nota, excedeu o limite de 3 meses!") {
          setError('A data desta nota fiscal excedeu o limite de 3 meses. Apenas notas fiscais emitidas nos últimos 3 meses são aceitas.');
          return;
        }
      }

      // Creditar pontos automaticamente se houver cliente
      if (clienteId && pontos > 0) {
        try {
          await addPointsToCustomer(clienteId, pontos, `NF-e ${numeroNota}`);
          setPontosCreditados(true);
          console.log(`✅ [INPUT MANUAL] Pontos creditados automaticamente: ${pontos} para cliente ${clienteId}`);
          
          // Salvar dados da nota fiscal na coleção
          if (dadosNotaParaSalvar && dadosNotaParaSalvar.nota) {
            console.log('💾 [INPUT MANUAL] Salvando dados da nota fiscal:', dadosNotaParaSalvar);
            
            const resultadoSalvamento = await imagemNotaFiscalService.salvarNotaFiscalDados(
              null, // pedidoId - será null para este caso
              clienteId,
              dadosNotaParaSalvar,
              'input_manual'
            );
            
            if (resultadoSalvamento.success) {
              console.log('✅ [INPUT MANUAL] Nota fiscal salva com sucesso');
            } else {
              console.error('❌ [INPUT MANUAL] Erro ao salvar nota fiscal:', resultadoSalvamento.error);
            }
          }
          
        } catch (creditError) {
          console.error('❌ [INPUT MANUAL] Erro ao creditar pontos automaticamente:', creditError);
          setError('Pontos obtidos, mas falha ao creditar. Tente novamente.');
        }
      }

      if (onNotaProcessada) {
        // Preferir dados retornados pelo n8n quando disponíveis
        const origem = Array.isArray(n8nResponse) ? n8nResponse[0] : (n8nResponse && typeof n8nResponse === 'object' ? n8nResponse : null);
        const numeroFinal = (origem?.nota || origem?.['nf-e'] || numeroNota);
        const dataFinal = (origem?.data_emissao || origem?.['data-emissao'] || null);
        const itens = origem?.produtos || origem?.items || [];
        const total = origem?.valorTotal || origem?.totalValue || 0;
        onNotaProcessada({ numero: numeroFinal, pontos, dataEmissao: dataFinal, orderDate: dataFinal, produtos: itens, valorTotal: total });
      }

    } catch (err) {
      console.error('Erro ao processar nota fiscal:', err);
      
      // Verificar se é erro de timeout
      if (err?.name === 'AbortError') {
        setError('Timeout na conexão com o servidor. Tente novamente.');
      } else if (err?.message && err.message.includes('Failed to fetch')) {
        setError('Erro de conexão. Verifique sua internet e tente novamente.');
      } else {
        setError(err?.message || 'Erro ao processar a consulta');
      }
      
      setResultado(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      {loading && (
        <FullScreenLoader>
          <LoaderCircle />
        </FullScreenLoader>
      )}
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
          {!loading && 'Consultar'}
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

          {/* Confirmação automática de pontos creditados */}
          {pontosCreditados ? (
            <SuccessMessage>
              <FiInfo /> {resultado.pontos} pontos foram creditados automaticamente!
            </SuccessMessage>
          ) : resultado.pontos > 0 ? (
            <InfoMessage>
              <FiInfo /> {resultado.pontos} pontos encontrados para esta nota.
            </InfoMessage>
          ) : (
            <InfoMessage>
              <FiAlertCircle /> Nenhum ponto disponível para esta nota.
            </InfoMessage>
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
  color: #991b1b;
  background-color: #fff5f5;
  padding: 0.9rem 1rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #fecaca;
  border-radius: 4px;
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

const InfoMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #f8f9fa;
  color: #666;
  padding: 0.8rem;
  font-weight: 400;
`;

export default NotaFiscalInput;

// Overlay loader (no text)
const FullScreenLoader = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const LoaderCircle = styled.div`
  width: 80px;
  height: 80px;
  border: 4px solid #f0f0f0;
  border-top: 4px solid #A91918;
  border-right: 4px solid #A91918;
  border-radius: 50%;
  animation: spin 1.2s linear infinite;
  position: relative;
`;
