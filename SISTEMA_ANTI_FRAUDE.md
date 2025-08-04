# Sistema Anti-Fraude - Validação de Notas Fiscais

## 🔒 Visão Geral

Este sistema implementa múltiplas camadas de validação para prevenir fraudes no processamento de notas fiscais, garantindo que apenas documentos legítimos sejam aceitos para crédito de pontos.

## 🛡️ Camadas de Segurança

### 1. **Validação SEFAZ (Nível Máximo)**
- **Extração da Chave NFe**: Identifica automaticamente a chave de 44 dígitos
- **Consulta Oficial**: Busca dados diretamente no Portal Nacional da NFe
- **Dados Garantidos**: Valor total, CNPJ emissor, data de emissão oficiais
- **Status**: ✅ 100% à prova de fraude

### 2. **Validação OCR com Chave (Nível Alto)**
- **Chave Identificada**: Chave NFe encontrada mas consulta SEFAZ falhou
- **Validações Extras**: Estrutura da chave, códigos UF, datas válidas
- **Status**: ⚠️ Validado com verificações anti-fraude

### 3. **Validação OCR Limitada (Nível Restritivo)**
- **Padrões Suspeitos**: Detecta sinais de possível fraude
- **Limitação de Pontos**: Máximo 50 pontos para casos suspeitos
- **Status**: 🚨 Pontos limitados por segurança

## 🔍 Detecção de Fraudes

### Padrões Suspeitos Identificados:
- Valores muito baixos (< R$ 5,00)
- Valores muito redondos (ex: R$ 10,00, R$ 20,00)
- Documentos muito simples (< 50 caracteres)
- Ausência de múltiplas linhas de produtos
- Formatação inconsistente

### Validações de Chave NFe:
- **Estrutura**: 44 dígitos numéricos obrigatórios
- **UF Válida**: Códigos entre 11-53
- **Data Válida**: Mês entre 1-12
- **Modelo**: Deve ser 055 (NFe)
- **Dígito Verificador**: Validação matemática

## 🏗️ Arquitetura do Sistema

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   Upload da Nota    │ -> │   Extração OCR      │ -> │  Validação SEFAZ    │
│   (Gemini Vision)   │    │   (Gemini + OCR)    │    │   (Portal NFe)      │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
           │                         │                         │
           v                         v                         v
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│ Dados Estruturados  │    │  Chave NFe (44d)    │    │  Dados Oficiais     │
│ (JSON + Raw Text)   │    │  Texto Completo     │    │  (SEFAZ Validado)   │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

## 🔧 Implementação Técnica

### Serviços Principais:

1. **`sefazValidation.js`**
   - Extração de chave NFe
   - Consulta ao Portal Nacional
   - Validações de estrutura
   - Detecção de padrões suspeitos

2. **`geminiService.js`** (Modificado)
   - Retorna texto OCR bruto
   - Dados estruturados JSON
   - Suporte para validação cruzada

3. **`UploadPedidoNovo.jsx`** (Atualizado)
   - Fluxo de 6 etapas incluindo validação
   - Interface com indicadores de segurança
   - Tratamento de casos suspeitos

### Fluxo de Validação:

```javascript
// 1. Análise OCR
const aiResult = await analyzeOrderWithGemini(base64, fileType);

// 2. Validação Anti-Fraude
const validation = await sefazValidationService.validateNotaFiscal(
  aiResult.rawText, 
  processedOrder
);

// 3. Decisão de Segurança
if (validation.validationType === 'sefaz_official') {
  // Usar dados oficiais SEFAZ
} else if (validation.suspiciousPatterns.length > 2) {
  // Limitar pontos por segurança
} else {
  // Processar normalmente com dados OCR
}
```

## 🚨 Cenários de Segurança

### Cenário 1 - NFe Válida
```
Input: Nota fiscal legítima com chave NFe
Process: Consulta SEFAZ → Dados oficiais
Result: ✅ Pontos creditados normalmente
Status: "Validado oficialmente via SEFAZ"
```

### Cenário 2 - OCR Confiável
```
Input: Documento sem chave ou SEFAZ indisponível
Process: Validações OCR → Verificações extras
Result: ⚠️ Pontos creditados com validação
Status: "Validado com verificações anti-fraude"
```

### Cenário 3 - Documento Suspeito
```
Input: Imagem com padrões de fraude
Process: Detecção de suspeitas → Limitação
Result: 🚨 Máximo 50 pontos creditados
Status: "Pontos limitados por segurança"
```

### Cenário 4 - Fraude Detectada
```
Input: Documento claramente fraudulento
Process: Validação falha → Bloqueio
Result: ❌ Processamento negado
Status: "Validação anti-fraude falhou"
```

## 📊 Métricas de Segurança

### Indicadores na Interface:
- **Verde**: Validado oficialmente via SEFAZ
- **Amarelo**: Validado com verificações extras
- **Laranja**: Pontos limitados por segurança
- **Vermelho**: Processamento negado

### Logs de Auditoria:
- Chave NFe identificada
- Método de validação usado
- Padrões suspeitos detectados
- Pontos originais vs creditados

## 🔄 Manutenção e Monitoramento

### Ajustes de Sensibilidade:
```javascript
// Em sefazValidation.js
const limitedPoints = Math.min(originalPoints, 50); // Ajustar limite
const tolerance = sefazData.valorTotal * 0.05; // Ajustar tolerância
```

### Novos Padrões Suspeitos:
```javascript
// Adicionar novas validações
if (extractedData.totalValue % 100 === 0 && extractedData.totalValue < 500) {
  validations.suspiciousPatterns.push('Valor suspeito múltiplo de 100');
}
```

## 🎯 Benefícios

1. **Segurança Máxima**: Prevenção efetiva de fraudes
2. **Experiência Fluida**: Usuários legítimos não são impactados
3. **Auditoria Completa**: Logs detalhados para investigação
4. **Flexibilidade**: Sistema degrada graciosamente quando APIs estão indisponíveis
5. **Transparência**: Usuário sabe exatamente como sua nota foi validada

## 🚀 Próximos Passos

1. **Machine Learning**: Implementar detecção mais sofisticada
2. **Base de CNPJs**: Validar emissores conhecidos
3. **Geolocalização**: Verificar consistência regional
4. **Blockchain**: Registro imutável de validações
5. **API Rate Limiting**: Prevenir ataques automatizados

---

**Status**: ✅ Implementado e Ativo  
**Última Atualização**: Agosto 2025  
**Responsável**: Sistema Fast - Equipe de Segurança
