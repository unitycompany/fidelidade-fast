# 🔍 GUIA RÁPIDO DE DEBUG - SISTEMA DE IMAGENS

## 🚀 PASSO A PASSO PARA RESOLVER O PROBLEMA

### 1️⃣ **PRIMEIRO: Acesse a Página de Teste**
1. Faça login no sistema como **admin**
2. No menu lateral, procure por **"🧪 Teste Upload"**
3. Clique para abrir a página de diagnóstico

### 2️⃣ **EXECUTE O DIAGNÓSTICO**
1. Na página de teste, clique em **"Executar Diagnóstico"**
2. Observe os logs que aparecem na parte inferior
3. Anote qualquer erro que apareça

### 3️⃣ **RESULTADOS ESPERADOS DO DIAGNÓSTICO**
✅ **Sucesso esperado:**
```
✅ Usuário autenticado: [seu-user-id]
📁 Buckets encontrados: ['notas-fiscais']
✅ Bucket "notas-fiscais" encontrado
✅ Tabela imagens_notas_fiscais existe
✅ Tabela clientes_fast existe
✅ Conseguiu listar arquivos no bucket
✅ Upload de teste bem-sucedido
```

### 4️⃣ **SE DER ERRO, IDENTIFIQUE O TIPO**

#### ❌ **Erro: Bucket não encontrado**
**Solução:**
1. Vá ao painel do Supabase
2. Storage > Buckets
3. Crie um bucket chamado `notas-fiscais`
4. Marque como **público**

#### ❌ **Erro: Tabela não existe**
**Solução:**
1. Vá ao painel do Supabase
2. SQL Editor
3. Execute o conteúdo do arquivo: `sql/20_tabela_imagens_notas.sql`

#### ❌ **Erro: Permission denied**
**Solução:**
1. Vá ao painel do Supabase
2. Storage > Policies
3. Adicione as 3 políticas do arquivo `SISTEMA_IMAGENS_NOTAS.md`

#### ❌ **Erro: Usuário não autenticado**
**Solução:**
1. Faça logout e login novamente
2. Verifique se o usuário tem role 'admin'

### 5️⃣ **TESTE REAL DE UPLOAD**
Depois que o diagnóstico passar:
1. Na página de teste, selecione um cliente
2. Escolha uma imagem pequena (< 2MB)
3. Clique em "Testar Upload"
4. Observe os logs detalhados

### 6️⃣ **LOGS DE SUCESSO ESPERADOS**
```
🚀 Iniciando upload de imagem
✅ Arquivo validado com sucesso
✅ Bucket pronto
📝 Nome do arquivo gerado
📤 Fazendo upload para o Supabase Storage
✅ Upload para storage bem-sucedido
🔗 URL pública gerada
💾 Salvando metadados no banco
✅ Metadados salvos no banco
🎉 Upload completo com sucesso!
```

### 7️⃣ **SE AINDA DER ERRO**
1. **Copie todos os logs** da página de teste
2. **Faça screenshot** do painel do Supabase (Storage e Tables)
3. **Me envie** as informações para análise detalhada

### 8️⃣ **VERIFICAÇÃO FINAL**
Depois do upload bem-sucedido:
1. Vá em **Gerenciar Usuários**
2. Clique no ícone 👁️ de um cliente
3. Veja se aparece a seção **"Imagens das Notas Fiscais"**
4. Clique em uma imagem para visualizar

---

## 🔧 **CONFIGURAÇÕES NECESSÁRIAS NO SUPABASE**

### **Storage:**
- ✅ Bucket `notas-fiscais` criado
- ✅ Bucket configurado como público
- ✅ 3 políticas RLS configuradas

### **Database:**
- ✅ Tabela `imagens_notas_fiscais` criada
- ✅ Tabela `clientes_fast` existe
- ✅ Triggers e índices aplicados

### **Auth:**
- ✅ Usuário logado como admin
- ✅ RLS habilitado nas tabelas

---

**💡 DICA:** Use sempre a página **"🧪 Teste Upload"** para diagnosticar problemas. Ela mostra exatamente onde está falhando!
