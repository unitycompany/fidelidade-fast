# SOLUÇÃO: Erro ao excluir usuário - "Key is still referenced from table 'pedidos_vendas'"

## ❌ Erro Identificado
```
DELETE https://...supabase.co/rest/v1/clientes_fast?id=... 409 (Conflict)
Erro: {code: '23503', details: 'Key is still referenced from table "pedidos_vendas".', 
message: 'update or delete on table "clientes_fast" violates foreign key constraint "pedidos_vendas_cliente_id_fkey"'}
```

**Causa:** As tabelas `pedidos_vendas` e `historico_pontos` fazem referência à `clientes_fast` mas **não possuem `ON DELETE CASCADE`**, impedindo a exclusão de usuários.

## ✅ Soluções Implementadas

### 1. Melhor tratamento de erro (✅ Aplicado)
- Adicionado tratamento específico para erro 23503 (foreign key constraint)
- Mensagens claras em português
- Instrução específica sobre qual script executar

### 2. Scripts SQL para corrigir Foreign Keys (📋 **EXECUTE AGORA**)

**OPÇÃO 1 - Script Completo (Recomendado):**
- **Arquivo:** `sql/29_fix_foreign_keys_cascade.sql`
- **O que faz:** Identifica automaticamente as constraints e recria com CASCADE

**OPÇÃO 2 - Script Simples (Se a opção 1 falhar):**
- **Arquivo:** `sql/29_fix_foreign_keys_SIMPLES.sql`  
- **O que faz:** Comandos diretos, pode executar linha por linha

## 🚀 COMO RESOLVER AGORA:

### Passo 1: Acesse o Supabase
1. Abra o painel do Supabase
2. Vá em "SQL Editor"

### Passo 2: Execute o Script
**Copie e cole este código no SQL Editor:**

```sql
-- SOLUÇÃO RÁPIDA - EXECUTE ISSO:
ALTER TABLE pedidos_vendas DROP CONSTRAINT IF EXISTS pedidos_vendas_cliente_id_fkey;
ALTER TABLE pedidos_vendas ADD CONSTRAINT pedidos_vendas_cliente_id_fkey 
    FOREIGN KEY (cliente_id) REFERENCES clientes_fast(id) ON DELETE CASCADE;

ALTER TABLE historico_pontos DROP CONSTRAINT IF EXISTS historico_pontos_cliente_id_fkey;
ALTER TABLE historico_pontos ADD CONSTRAINT historico_pontos_cliente_id_fkey 
    FOREIGN KEY (cliente_id) REFERENCES clientes_fast(id) ON DELETE CASCADE;

-- VERIFICAR SE FUNCIONOU:
SELECT 'RESULTADO' as status, tc.table_name, rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
WHERE tc.table_name IN ('pedidos_vendas', 'historico_pontos') AND tc.constraint_type = 'FOREIGN KEY';
```

### Passo 3: Verificar
Após executar, você deve ver:
- `pedidos_vendas` com `delete_rule` = `CASCADE`  
- `historico_pontos` com `delete_rule` = `CASCADE`

## ✅ Resultado Final
Após executar o script:
- ❌ Antes: Erro 409 - "Key is still referenced from table pedidos_vendas"
- ✅ Depois: Exclusão funcionando perfeitamente + dados relacionados removidos automaticamente

## Status:
- [x] Código corrigido para melhor tratamento de erro
- [x] Scripts SQL criados  
- [ ] **⚠️ SCRIPT PRECISA SER EXECUTADO NO SUPABASE**
- [ ] Teste de exclusão

**Uma vez executado o script, o problema estará 100% resolvido!**
