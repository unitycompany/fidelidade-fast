import { GoogleGenerativeAI } from "@google/generative-ai";

// Configuração da IA
const API_KEY = process.env.REACT_APP_GOOGLE_AI_KEY || "YOUR_GOOGLE_AI_KEY";
const genAI = new GoogleGenerativeAI(API_KEY);

export class AINotaProcessor {
    constructor() {
        this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }

    // Processar imagem da nota fiscal com IA Gemini
    async processImage(imageFile) {
        try {
            console.log("🤖 Iniciando processamento com IA...");

            // Converter arquivo para base64
            const imageData = await this.fileToGenerativePart(imageFile);

            const prompt = `
Você é um especialista em análise de notas fiscais brasileiras. Analise esta imagem de nota fiscal e extraia TODAS as informações de produtos de forma estruturada.

IMPORTANTE: Para cada produto encontrado, retorne:
1. Código do produto (se disponível)
2. Descrição/nome do produto
3. Quantidade
4. Valor unitário
5. Valor total
6. Texto da linha original (para referência)

Retorne no seguinte formato JSON:
{
  "company_name": "Nome da empresa emissora",
  "cnpj": "CNPJ da empresa",
  "invoice_number": "Número da nota fiscal",
  "invoice_date": "Data da emissão",
  "total_value": valor_total_da_nota,
  "products": [
    {
      "code": "código_do_produto",
      "description": "descrição_do_produto",
      "quantity": quantidade_numerica,
      "unit_price": valor_unitario_numerico,
      "total_price": valor_total_numerico,
      "line_text": "texto_original_da_linha"
    }
  ]
}
`;

            const result = await this.model.generateContent([prompt, imageData]);
            const response = await result.response;
            const text = await response.text();

            console.log("🤖 Resposta bruta da IA:", text);

            // Extração e parse do JSON
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Resposta da IA não contém JSON válido');
            }
            const parsedData = JSON.parse(jsonMatch[0]);
            console.log("✅ Dados extraídos pela IA:", parsedData);

            return parsedData;
        } catch (error) {
            console.error("❌ Erro no processamento com IA:", error);
            throw new Error(`Erro na análise da nota fiscal: ${error.message}`);
        }
    }

    // Converter arquivo para formato da IA
    async fileToGenerativePart(file) {
        const base64EncodedData = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(file);
        });
        return { inlineData: { data: base64EncodedData, mimeType: file.type } };
    }
}

// Exportar instância para uso global
export const aiProcessor = new AINotaProcessor();
