// Serviço para integrar com um webhook do n8n

class N8nService {
  constructor() {
    this.webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || '';
    this.timeoutMs = 15000; // 15s
    if (!this.webhookUrl) {
      console.warn('[n8n] VITE_N8N_WEBHOOK_URL não configurada. Fluxo n8n ficará inativo.');
    }
  }

  isConfigured() {
    return !!this.webhookUrl;
  }

  /**
   * Envia dados da nota para o n8n e espera um JSON com { pontos: number }
   * @param {{
   *  numeroNota?: string,
   *  chaveNFe?: string,
   *  valorTotal?: number,
   *  clienteId?: string|number,
   *  imagemBase64?: string,
   *  extras?: Record<string, any>
   * }} payload
   */
  async enviarDadosNota(payload = {}) {
    if (!this.isConfigured()) {
      return { success: false, error: 'Webhook n8n não configurado' };
    }

    const body = {
      source: 'sistema-de-fidelidade-web',
      timestamp: new Date().toISOString(),
      numeroNota: payload.numeroNota || null,
      chaveNFe: payload.chaveNFe || null,
      valorTotal: typeof payload.valorTotal === 'number' ? payload.valorTotal : null,
      clienteId: payload.clienteId || null,
      imagemBase64: payload.imagemBase64 || null, // opcional; evite enviar arquivos muito grandes
      ...payload.extras
    };

    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), this.timeoutMs);
      const resp = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      clearTimeout(id);

      if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        throw new Error(`HTTP ${resp.status} ${resp.statusText}: ${text?.slice(0, 300)}`);
      }

      const data = await resp.json().catch(() => ({}));
      const pontos = Number(data?.pontos);
      if (!Number.isFinite(pontos)) {
        return { success: false, error: 'Resposta do n8n inválida: campo "pontos" ausente ou não numérico', data };
      }
      return { success: true, pontos, data };
    } catch (err) {
      console.error('[n8n] Erro no webhook:', err);
      return { success: false, error: err.message || 'Falha ao chamar webhook do n8n' };
    }
  }
}

const n8nService = new N8nService();
export default n8nService;
