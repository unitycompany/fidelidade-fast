// Extrator gratuito usando Tesseract (sem IA externa)
// Objetivo: ler texto da imagem, extrair chave NFe e valor total

const normalizeNumber = (str) => (str || '').replace(/[^0-9]/g, '');

const parseCurrencyBR = (str) => {
  if (!str) return null;
  let s = str.replace(/[\sR$]/g, '').trim();
  // Trocar separadores brasileiros para formato JS
  // Regras: último separador é decimal, anteriores são milhar
  const lastComma = s.lastIndexOf(',');
  const lastDot = s.lastIndexOf('.');
  const lastSep = Math.max(lastComma, lastDot);
  if (lastSep >= 0) {
    const intPart = s.slice(0, lastSep).replace(/[\.,]/g, '');
    const decPart = s.slice(lastSep + 1).replace(/[^0-9]/g, '');
    s = `${intPart}.${decPart}`;
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

const extractChaveNFe = (text) => {
  if (!text) return null;
  const clean = text.replace(/O/g, '0').replace(/\s+/g, ' ');
  // Linhas candidatas com palavras-chave
  const lines = clean.split(/\n|\r/);
  const candidates = [];
  for (const line of lines) {
    const lu = line.toUpperCase();
    if (/(CHAVE|ACESSO|NFE|NF-E|CHAVE DE ACESSO)/.test(lu)) {
      const digits = line.replace(/\D/g, '');
      if (digits.length >= 40) candidates.push(digits);
    }
  }
  // Fallback: maior sequência de dígitos com 40-60 caracteres
  const global = clean.replace(/\D/g, ' ');
  const seqs = global.split(' ').filter(s => s.length >= 40 && s.length <= 60);
  candidates.push(...seqs);
  // Normalizar e escolher 44 dígitos
  for (const c of candidates) {
    const digits = c.replace(/\D/g, '');
    if (digits.length === 44) return digits;
    if (digits.length > 44) {
      // Tentar janelas de 44
      for (let i = 0; i + 44 <= digits.length; i++) {
        const slice = digits.slice(i, i + 44);
        if (slice.length === 44) return slice;
      }
    }
  }
  return null;
};

const extractValorTotal = (text) => {
  if (!text) return null;
  const lines = text.split(/\n|\r/);
  // Procurar pelo label de total e pegar o primeiro número depois
  for (const line of lines) {
    const lu = line.toUpperCase();
    if (/(VALOR\s*TOTAL|TOTAL\s*GERAL|TOTAL\s*DA\s*NOTA|VALOR\s*DA\s*NF)/.test(lu)) {
      const match = line.match(/(R\$\s*)?\d{1,3}(?:[\.,]\d{3})*(?:[\.,]\d{2})|\d+[\.,]\d{2}/);
      if (match) {
        const n = parseCurrencyBR(match[0]);
        if (n !== null) return n;
      }
    }
  }
  // Fallback: maior número com 2 casas decimais no documento
  const matches = text.match(/(R\$\s*)?\d{1,3}(?:[\.,]\d{3})*(?:[\.,]\d{2})|\d+[\.,]\d{2}/g) || [];
  let best = null;
  for (const m of matches) {
    const n = parseCurrencyBR(m);
    if (n !== null && (best === null || n > best)) best = n;
  }
  return best;
};

export const analyzeOrderWithFreeOCR = async (base64Image) => {
  try {
    const { extrairTextoDeImagem } = await import('./ocrService.js');
    const ocr = await extrairTextoDeImagem(base64Image);
    if (!ocr.success || !ocr.text) {
      return { success: false, error: ocr.error || 'Falha no OCR' };
    }

    const chave = extractChaveNFe(ocr.text);
    const total = extractValorTotal(ocr.text) || 0;

    const dados = {
      numeroPedido: 'N/A',
      dataEmissao: 'N/A',
      fornecedor: 'N/A',
      valorTotalPedido: total,
      chaveNFe: {
        chaveCompleta: chave || 'N/A',
        encontradaAbaixoCodigoBarras: false
      },
      resumo: {
        valorTotalConfirmado: total,
        chaveNFeEncontrada: !!chave,
        confiancaExtracao: Math.round(ocr.confidence || 0)
      },
      debug: {
        metodoExtracao: 'tesseract_local',
        tamanhoTexto: ocr.text.length
      }
    };

    return { success: true, data: dados, metodo: 'ocr_free' };
  } catch (e) {
    console.error('[FreeOCR] Erro no extrator gratuito:', e);
    return { success: false, error: e.message || 'Erro no extrator gratuito' };
  }
};

export default { analyzeOrderWithFreeOCR };
