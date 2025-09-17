import { supabase } from '../services/supabase'

// Seta estoque_disponivel=10 onde estiver nulo (apenas para prêmios não ilimitados)
export async function ajustarEstoqueInicial(qtdPadrao = 10) {
  try {
    // Atualizar registros sem estoque definido
    const { error: errNull } = await supabase
      .from('premios_catalogo')
      .update({ estoque_disponivel: qtdPadrao })
      .eq('estoque_ilimitado', false)
      .is('estoque_disponivel', null)

    if (errNull) {
      console.warn('⚠️ Não foi possível ajustar estoque inicial (nulos):', errNull.message)
    }

    // Opcional: corrigir negativos para pelo menos 0
    const { data, error: fetchError } = await supabase
      .from('premios_catalogo')
      .select('id, estoque_disponivel, estoque_ilimitado')

    if (!fetchError) {
      const negativos = (data || []).filter(p => p.estoque_ilimitado === false && (Number(p.estoque_disponivel) || 0) < 0)
      for (const p of negativos) {
        await supabase.from('premios_catalogo').update({ estoque_disponivel: 0 }).eq('id', p.id)
      }
    }
  } catch (e) {
    console.warn('⚠️ ajustarEstoqueInicial falhou:', e?.message || e)
  }
}

export default ajustarEstoqueInicial
