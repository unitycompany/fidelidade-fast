#!/usr/bin/env python3
"""
Script para limpar o arquivo UploadPedidoNovo.jsx e manter apenas a lógica do Gemini
"""

import re

def fix_upload_file():
    file_path = "src/components/UploadPedidoNovo.jsx"
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remover imports desnecessários
    imports_to_remove = [
        "import { analyzeOrderWithOpenAI } from '../services/openaiService';",
        "import { analyzeOrderWithClaude } from '../services/claudeService';",
        "import { analyzeOrder as analyzeOrderWithSimulation } from '../services/simulatedAI';",
        "import { analyzeOrderWithOcrReal, checkOcrRealServiceHealth } from '../services/ocrRealService';"
    ]
    
    for import_line in imports_to_remove:
        content = content.replace(import_line, "")
    
    # Encontrar e remover toda a lógica de fallback
    # Padrão: desde "} catch (geminiError)" até "// Aguardando o processamento"
    pattern = r'(\} catch \(geminiError\) \{.*?)(\s*// Aguardando o processamento de dados pela IA)'
    
    replacement = '''} catch (geminiError) {
                console.warn('⚠️ Erro na API Gemini:', geminiError.message);
                
                // Verificar se é erro de quota/limite diário
                if (geminiError.message.includes('429') || 
                    geminiError.message.includes('quota') || 
                    geminiError.message.includes('rate_limit') ||
                    geminiError.message.includes('usage_limit') ||
                    geminiError.message.includes('resource_exhausted')) {
                    
                    console.log('🚨 Gemini: Limite diário excedido');
                    
                    // Mostrar mensagem específica para limite diário
                    setResult({
                        orderNumber: `LIMIT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                        customer: 'Sistema Fast',
                        totalValue: 0,
                        totalPoints: 0,
                        items: [],
                        allProducts: [],
                        error: true,
                        dailyLimitExceeded: true,
                        errorMessage: 'Limite diário de análise de notas fiscais excedido. Tente novamente amanhã após 00:00h.',
                        quotaExceeded: true
                    });
                    return; // Parar processamento aqui
                } else {
                    // Outros tipos de erro - relançar para ser tratado pelo catch principal
                    throw geminiError;
                }
            }

            // Aguardando o processamento de dados pela IA'''
    
    content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    # Limpar linhas vazias excessivas
    content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ Arquivo limpo com sucesso! Apenas a lógica do Gemini foi mantida.")

if __name__ == "__main__":
    fix_upload_file()
