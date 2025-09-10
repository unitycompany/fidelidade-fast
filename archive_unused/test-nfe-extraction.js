// Teste da extração melhorada de chave NFe
import { sefazValidationService } from './src/services/sefazValidation.js';

// Simular alguns textos OCR com chaves NFe mais realistas
const testCases = [
    {
        name: 'NFe SP 2024 com chave válida',
        text: 'NOTA FISCAL ELETRÔNICA\nChave de Acesso: 3524 0823 4567 8901 2345 6789 5500 1000 0001 2345 6789 0123\nValor Total: R$ 1.234,56'
    },
    {
        name: 'NFe RJ 2023 sem formatação',
        text: 'NFE 33230512345678901234555001000000012345678901234 Empresa XYZ LTDA'
    },
    {
        name: 'NFe MG 2024 misturada no texto',
        text: 'Dados da empresa ABC123456 e outros números 99887766 mas a chave real é 31240523456789012345555001000000067891234567890 escondida no meio'
    },
    {
        name: 'Texto com chave NFe real de SP',
        text: 'DCS DISTRIBUICAO DE MATERIAIS\nCNPJ: 12.345.678/0001-90\nNFe: 35240512345678901234555001000000520391234567890\nData: 23/05/2024\nValor: R$ 3.193,63'
    },
    {
        name: 'NFe com chave bem escondida',
        text: 'Protocolo ABC123 Empresa XPTO dados diversos 31240612345678901234555001000000123451234567890 outras informações'
    }
];

console.log('🧪 TESTE DE EXTRAÇÃO DE CHAVE NFe REALISTA');
console.log('='.repeat(55));

for (const testCase of testCases) {
    console.log(`\n📋 Teste: ${testCase.name}`);
    console.log(`📄 Texto: ${testCase.text.substring(0, 80)}...`);

    const chave = sefazValidationService.extractNFeKey(testCase.text);

    if (chave) {
        console.log(`✅ Chave encontrada: ${chave}`);

        // Validar estrutura
        const validation = sefazValidationService.validateNFeKeyStructure(chave);
        console.log(`🔍 Validação estrutural: ${validation.valid ? '✅ Válida' : '❌ Inválida - ' + validation.error}`);

        if (validation.valid) {
            console.log(`📊 Detalhes: UF=${validation.uf}, Ano=${validation.ano}, Mês=${validation.mes}, Modelo=${validation.modelo}`);
        }
    } else {
        console.log('❌ Nenhuma chave encontrada');
    }

    console.log('-'.repeat(50));
}

console.log('\n🎯 TESTE CONCLUÍDO!');
