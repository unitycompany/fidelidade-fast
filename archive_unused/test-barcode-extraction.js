// Teste da extração de chave NFe via códigos de barras
import { sefazValidationService } from './src/services/sefazValidation.js';

// Testes com códigos de barras simulados
const testCases = [
    {
        name: 'NFe com código de barras explícito',
        text: `
DANFE - DOCUMENTO AUXILIAR DA NOTA FISCAL ELETRÔNICA
DCS DISTRIBUICAO DE MATERIAIS LTDA
CNPJ: 12.345.678/0001-90

Código de Barras:
35240512345678901234555001000000520391234567890123456789012345

Produtos:
MASSA DRYWALL - 25 KG - PLACOMIX - R$ 130,32
Valor Total: R$ 3.193,63
        `
    },
    {
        name: 'NFe com sequência longa de números',
        text: `
NOTA FISCAL ELETRÔNICA
Empresa ABC LTDA
CNPJ: 98.765.432/0001-00

35230612345678901234555001000000123451234567890987654321098765432109876543210

PRODUTOS:
Item 1: Produto A - R$ 100,00
Item 2: Produto B - R$ 200,00
TOTAL: R$ 300,00
        `
    },
    {
        name: 'NFe com barcode próximo a palavras-chave',
        text: `
DANFE
Empresa XYZ
NFe 31240723456789012345555001000000098761234567890

Material de construção
Valor: R$ 1.500,00
        `
    },
    {
        name: 'NFe com código de barras longo',
        text: `
||||||||||||||||||||||||||||||||||||||||||||||
33230812345678901234555001000000567891234567890123456789012345678901234567890
||||||||||||||||||||||||||||||||||||||||||||||

DISTRIBUIDOR DE MATERIAIS
Total: R$ 2.450,00
        `
    },
    {
        name: 'NFe sem código de barras (teste fallback)',
        text: `
EMPRESA SEM BARCODE LTDA
CNPJ: 11.222.333/0001-44
Produtos diversos
Total: R$ 500,00
        `
    }
];

console.log('🧪 TESTE DE EXTRAÇÃO VIA CÓDIGOS DE BARRAS');
console.log('='.repeat(60));

for (const testCase of testCases) {
    console.log(`\n📋 Teste: ${testCase.name}`);
    console.log(`📄 Texto (resumo): ${testCase.text.substring(0, 100).replace(/\s+/g, ' ')}...`);

    // Testar extração direta de código de barras
    console.log('\n📊 Testando extração de código de barras...');
    const barcodeKey = sefazValidationService.extractFromBarcode(testCase.text);

    if (barcodeKey) {
        console.log(`✅ Chave encontrada via barcode: ${barcodeKey}`);

        // Validar estrutura
        const validation = sefazValidationService.validateNFeKeyStructure(barcodeKey);
        console.log(`🔍 Validação: ${validation.valid ? '✅ Válida' : '❌ Inválida - ' + validation.error}`);

        if (validation.valid) {
            console.log(`📊 Detalhes: UF=${validation.uf}, Ano=${validation.ano}, Mês=${validation.mes}`);
        }
    } else {
        console.log('❌ Nenhuma chave encontrada via código de barras');

        // Testar método tradicional como fallback
        console.log('🔄 Testando método tradicional...');
        const traditionalKey = sefazValidationService.extractNFeKey(testCase.text);
        if (traditionalKey) {
            console.log(`✅ Chave encontrada via método tradicional: ${traditionalKey}`);
        } else {
            console.log('❌ Nenhuma chave encontrada por nenhum método');
        }
    }

    console.log('-'.repeat(50));
}

console.log('\n🎯 TESTE DE CÓDIGOS DE BARRAS CONCLUÍDO!');
