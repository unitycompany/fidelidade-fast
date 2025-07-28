# 🛠️ CORREÇÃO: Erro de JSON Malformado do Gemini

## 🔍 PROBLEMA IDENTIFICADO
O Gemini estava retornando JSON com formato inválido, causando erro:
```
Expected double-quoted property name in JSON at position 456 (line 15 column 27)
```

## ✅ SOLUÇÕES IMPLEMENTADAS

### 1. **Limpeza Automática de JSON (`geminiService.js`)**

```javascript
// Função para limpar e corrigir JSON comum da IA
const limparJSON = (jsonString) => {
    try {
        // Tentar parsing direto primeiro
        return JSON.parse(jsonString);
    } catch (error) {
        console.log('[Gemini] Erro no JSON original, tentando correções automáticas...');
        
        let jsonLimpo = jsonString;
        
        // Correção 1: Remover comentários de linha
        jsonLimpo = jsonLimpo.replace(/\/\/.*$/gm, '');
        
        // Correção 2: Remover comentários de bloco
        jsonLimpo = jsonLimpo.replace(/\/\*[\s\S]*?\*\//g, '');
        
        // Correção 3: Corrigir aspas simples para aspas duplas em chaves
        jsonLimpo = jsonLimpo.replace(/'([^']+)':/g, '"$1":');
        
        // Correção 4: Corrigir valores com aspas simples
        jsonLimpo = jsonLimpo.replace(/:\s*'([^']*)'/g, ': "$1"');
        
        // Correção 5: Adicionar aspas em propriedades sem aspas
        jsonLimpo = jsonLimpo.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
        
        // Correção 6: Remover vírgulas extras antes de }
        jsonLimpo = jsonLimpo.replace(/,(\s*[}\]])/g, '$1');
        
        // Correção 7: Corrigir true/false sem aspas (manter como boolean)
        jsonLimpo = jsonLimpo.replace(/:\s*"(true|false)"/g, ': $1');
        
        // Correção 8: Corrigir números com aspas desnecessárias
        jsonLimpo = jsonLimpo.replace(/:\s*"(\d+\.?\d*)"/g, ': $1');
        
        console.log('[Gemini] JSON após correções:', jsonLimpo);
        
        // Tentar parsing novamente
        try {
            return JSON.parse(jsonLimpo);
        } catch (secondError) {
            console.error('[Gemini] Falha mesmo após correções:', secondError);
            console.error('[Gemini] JSON problemático:', jsonLimpo);
            throw new Error(`JSON inválido mesmo após correções automáticas: ${secondError.message}`);
        }
    }
};
```

### 2. **Prompt Melhorado para JSON Válido**

```
⚠️ ATENÇÃO: RETORNE APENAS JSON VÁLIDO!
- Use APENAS aspas duplas (")
- NÃO adicione comentários
- NÃO use aspas simples (')
- NÃO coloque vírgulas extras
- NÃO adicione texto antes ou depois do JSON
- TESTE o JSON mentalmente antes de enviar

FORMATO FINAL OBRIGATÓRIO:
{"numeroPedido":"valor","dataEmissao":"valor",...}
```

### 3. **Tratamento de Erros Específicos (`UploadPedidoNovo.jsx`)**

```javascript
// Verificar se é erro de JSON malformado
} else if (geminiError.message.includes('JSON') || 
          geminiError.message.includes('Expected double-quoted') ||
          geminiError.message.includes('Unexpected token') ||
          geminiError.message.includes('Unexpected end of JSON')) {
    
    console.log('🔧 Erro de parsing JSON - tentando reprocessar...');
    
    // Tentar novamente uma vez para erros de JSON
    try {
        console.log('🔄 Tentativa #2 de análise com Gemini...');
        aiResult = await analyzeOrderWithGemini(base64, selectedFile.type);
        
        if (aiResult.success) {
            console.log('✅ Sucesso na segunda tentativa');
        } else {
            throw new Error('Falha na segunda tentativa');
        }
    } catch (secondError) {
        console.error('❌ Falha definitiva após segunda tentativa:', secondError);
        
        setResult({
            orderNumber: `ERROR-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            customer: 'Sistema Fast',
            // ... dados de erro amigável
            errorMessage: 'Erro no processamento da imagem. O documento pode estar muito borrado ou com formato não suportado. Tente uma imagem mais nítida.',
            processingMethod: 'json_error'
        });
        return;
    }
}
```

### 4. **Logs Detalhados para Depuração**

- Logs do JSON bruto extraído
- Logs do JSON após limpeza
- Logs das correções aplicadas
- Logs de tentativas de reprocessamento

## 🎯 RESULTADOS ESPERADOS

1. **JSON inválido é automaticamente corrigido** através de 8 regras de limpeza
2. **Erros de JSON causam nova tentativa** antes de falhar definitivamente 
3. **Mensagens de erro amigáveis** para o usuário final
4. **Logs detalhados** para identificar problemas rapidamente

## 🧪 COMO TESTAR

1. Faça upload de uma nota fiscal
2. Se aparecer erro de JSON, verifique os logs do console:
   - `[Gemini] JSON extraído bruto:` - JSON original
   - `[Gemini] JSON após correções:` - JSON corrigido
   - `🔄 Tentativa #2 de análise` - Se houve retry
3. Verifique se o processamento foi concluído ou se mostra erro amigável

## 🔧 CORREÇÕES AUTOMÁTICAS IMPLEMENTADAS

- ✅ Remoção de comentários (`// texto` e `/* texto */`)
- ✅ Correção de aspas simples para duplas
- ✅ Adição de aspas em propriedades sem aspas
- ✅ Remoção de vírgulas extras
- ✅ Preservação de valores boolean e numéricos
- ✅ Retry automático para erros de JSON
- ✅ Mensagens de erro amigáveis

O sistema agora é mais robusto contra variações na resposta do Gemini! 🎉
