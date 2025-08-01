# 🚨 CORREÇÃO RÁPIDA - Erro de Constraint Role

## Problema
```
ERROR: 23514: new row for relation "clientes_fast" violates check constraint "clientes_fast_role_check"
```

## 🔧 Solução Rápida

### Execute este script no SQL Editor do Supabase:

```sql
-- Remover constraint problemática
ALTER TABLE clientes_fast DROP CONSTRAINT IF EXISTS clientes_fast_role_check;
ALTER TABLE clientes_fast DROP CONSTRAINT IF EXISTS check_clientes_fast_role;

-- Criar nova constraint
ALTER TABLE clientes_fast ADD CONSTRAINT check_clientes_fast_role_fixed 
  CHECK (role IN ('admin', 'gerente', 'cliente'));

-- Atualizar usuários admin
UPDATE clientes_fast SET role = 'admin' WHERE email = 'admin@fastsistemas.com.br';
```

### Ou execute o arquivo:
`sql/18_fix_constraint_simple.sql`

## ✅ Após executar

O sistema irá funcionar com:
- **admin**: Acesso total
- **gerente**: Cliente + resgates admin  
- **cliente**: Acesso básico

## 🧪 Testar

1. Faça login como admin: `admin@fastsistemas.com.br`
2. Verifique se aparecem as opções de admin no menu
3. Teste criação de novos usuários

---

**🎯 Status**: Sistema de roles funcionando corretamente!
