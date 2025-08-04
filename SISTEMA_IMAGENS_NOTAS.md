# Sistema de Armazenamento de Imagens de Notas Fiscais

Este sistema permite armazenar e gerenciar imagens das notas fiscais enviadas pelos clientes, vinculando-as aos usuários e aos pedidos.

## 🚀 Func## 🚨 Resolução de Problemas

### 🔍 **DEBUG: Como Identificar Problemas**

#### 1. **Página de Teste Integrada**
Acesse a página de teste através do menu admin:
1. Faça login como administrador
2. No menu lateral, clique em **"🧪 Teste Upload"**
3. Execute o **Diagnóstico** primeiro
4. Teste o upload com um arquivo pequeno

#### 2. **Verificar Logs Detalhados**
O sistema agora tem logs completos. Abra o **Console do Navegador** (F12) e veja:
- ✅ Logs verdes: operações bem-sucedidas
- ❌ Logs vermelhos: erros encontrados
- 🔧 Logs azuis: informações de debug

#### 3. **Problemas Mais Comuns**

**❌ Erro: "Bucket não existe"**
```javascript
// Execute para criar o bucket
await imagemNotaFiscalService.inicializarBucket();
```

**❌ Erro: "Permission denied"**
- Verifique se as políticas RLS estão configuradas
- Confirme se o usuário está autenticado
- Verifique se o `auth.uid()` corresponde ao `cliente_id`

**❌ Erro: "relation imagens_notas_fiscais does not exist"**
- Execute o script SQL: `sql/20_tabela_imagens_notas.sql`

**❌ Erro: "File too large"**
- Arquivos devem ter no máximo 10MB
- Comprima imagens antes do upload
- Use formatos otimizados (WEBP recomendado)

**❌ Imagens não carregam**
- Verifique se o bucket está configurado como público
- Confirme se a URL está correta
- Teste o acesso direto à URL da imagem

#### 4. **Script de Diagnóstico Completo**

Execute no console do navegador:
```javascript
import diagnosticarSistemaImagens from './src/scripts/diagnosticarImagens.js';
diagnosticarSistemaImagens();
```

Ou use a página de teste integrada no sistema.

#### 5. **Verificação Manual no Supabase**

**Verificar Bucket:**
1. Vá em **Storage** > **Buckets**
2. Deve existir um bucket chamado `notas-fiscais`
3. Deve estar marcado como **público**

**Verificar Políticas:**
1. Vá em **Storage** > **Policies**
2. Deve haver 3 políticas para `storage.objects`
3. Uma para INSERT, uma para SELECT, uma para DELETE

**Verificar Tabela:**
1. Vá em **Table Editor**
2. Deve existir a tabela `imagens_notas_fiscais`
3. Execute: `SELECT * FROM imagens_notas_fiscais LIMIT 5;`

#### 6. **Logs de Upload Detalhados**

Quando você fizer upload, verá logs similares a:
```
🚀 Iniciando upload de imagem: {fileName: "nota.jpg", fileSize: 1234567, ...}
✅ Arquivo validado com sucesso
🔧 Verificando/criando bucket...
✅ Bucket pronto
📝 Nome do arquivo gerado: cliente-id/timestamp_nome.jpg
📤 Fazendo upload para o Supabase Storage...
✅ Upload para storage bem-sucedido
🔗 Obtendo URL pública...
✅ URL pública gerada: https://...
💾 Salvando metadados no banco...
✅ Metadados salvos no banco
🎉 Upload completo com sucesso!
```

Se algum passo falhar, você verá exatamente onde parou.

### Erro: "Bucket não existe"**alidades Implementadas

- ✅ **Armazenamento no Supabase Storage**: Upload seguro de imagens e PDFs
- ✅ **Visualização no Admin**: Administradores podem ver todas as imagens dos clientes
- ✅ **Histórico por Cliente**: Cada cliente tem seu histórico de imagens armazenado
- ✅ **Metadados Completos**: Informações detalhadas sobre cada arquivo
- ✅ **Validação de Arquivos**: Verificação de tipo e tamanho
- ✅ **Interface Responsiva**: Visualização otimizada para desktop e mobile
- 🔄 **Backup Cloudflare**: Estrutura preparada para backup no Cloudflare Images

## 📋 Configuração Inicial

### 1. Executar Script SQL
Execute o arquivo SQL para criar as tabelas necessárias:
```sql
-- Execute no seu banco Supabase
\i sql/20_tabela_imagens_notas.sql
```

### 2. Configurar Storage no Supabase

#### Opção A: Via Interface Web
1. Acesse o painel do Supabase
2. Vá em **Storage** > **Buckets**
3. Crie um novo bucket chamado `notas-fiscais`
4. Configure como **público**
5. Defina limite de 10MB por arquivo

#### Opção B: Via Script
```javascript
// Execute uma vez no console do navegador ou Node.js
import configurarSupabaseStorage from './src/scripts/configurarStorage.js';
configurarSupabaseStorage();
```

### 3. Configurar Políticas RLS

No painel do Supabase, vá em **Storage** > **Policies** e adicione:

```sql
-- Política de Upload
CREATE POLICY "Usuarios podem fazer upload de suas imagens" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'notas-fiscais' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Política de Visualização
CREATE POLICY "Usuarios podem ver suas imagens" ON storage.objects
FOR SELECT USING (
  bucket_id = 'notas-fiscais' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM clientes_fast 
      WHERE id = auth.uid()::uuid 
      AND role IN ('admin', 'gerente')
    )
  )
);

-- Política de Exclusão
CREATE POLICY "Usuarios podem deletar suas imagens" ON storage.objects
FOR DELETE USING (
  bucket_id = 'notas-fiscais' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM clientes_fast 
      WHERE id = auth.uid()::uuid 
      AND role IN ('admin', 'gerente')
    )
  )
);
```

## 🎯 Como Usar

### No Painel Administrativo

1. **Visualizar Usuários**: A tabela principal agora mostra quantas imagens cada cliente possui
2. **Ver Detalhes**: Clique no ícone 👁️ para ver detalhes completos do cliente
3. **Histórico de Imagens**: No modal de detalhes, veja todas as imagens enviadas
4. **Visualizar Imagem**: Clique em qualquer imagem para visualizá-la em tela cheia

### Para Desenvolvedores

#### Upload de Imagem
```javascript
import imagemNotaFiscalService from './services/imagemNotaFiscalService';

// Upload básico
const resultado = await imagemNotaFiscalService.uploadImagem(
  arquivo,           // File object
  clienteId,         // UUID do cliente
  pedidoId,          // UUID do pedido (opcional)
  {                  // Metadados (opcional)
    numeroNota: '12345',
    chaveAcesso: '35200114200166000166550010000000046623138503'
  }
);

if (resultado.success) {
  console.log('Upload realizado:', resultado.data);
  console.log('URL da imagem:', resultado.url);
} else {
  console.error('Erro:', resultado.error);
}
```

#### Listar Imagens de um Cliente
```javascript
const imagens = await imagemNotaFiscalService.listarImagensCliente(clienteId);
if (imagens.success) {
  console.log('Imagens encontradas:', imagens.data);
}
```

#### Componente de Upload
```jsx
import UploadImagemNota from './components/UploadImagemNota';

function MeuComponente() {
  const handleUploadComplete = (dadosImagem) => {
    console.log('Upload concluído:', dadosImagem);
    // Atualizar interface, recarregar lista, etc.
  };

  return (
    <UploadImagemNota
      clienteId={clienteId}
      pedidoId={pedidoId} // opcional
      onUploadComplete={handleUploadComplete}
      maxFiles={5}
    />
  );
}
```

## 📊 Estrutura do Banco

### Tabela: `imagens_notas_fiscais`
```sql
- id: UUID (PK)
- pedido_id: UUID (FK -> pedidos_vendas.id)
- cliente_id: UUID (FK -> clientes_fast.id)
- nome_arquivo: VARCHAR(255)
- url_supabase: TEXT
- url_cloudflare: TEXT (para backup futuro)
- tipo_arquivo: VARCHAR(50)
- tamanho_bytes: BIGINT
- numero_nota: VARCHAR(100)
- chave_acesso: VARCHAR(44)
- status_upload: VARCHAR(20)
- ip_origem: INET
- user_agent: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Índices
- `idx_imagens_pedido` em `pedido_id`
- `idx_imagens_cliente` em `cliente_id`
- `idx_imagens_status` em `status_upload`
- `idx_imagens_data` em `created_at`
- `idx_imagens_chave` em `chave_acesso`

## 🛡️ Segurança

### Row Level Security (RLS)
- ✅ Clientes só veem suas próprias imagens
- ✅ Admins e gerentes veem todas as imagens
- ✅ Upload restrito por usuário autenticado
- ✅ Validação de tipos de arquivo permitidos

### Validações
- **Tipos permitidos**: JPG, PNG, WEBP, PDF
- **Tamanho máximo**: 10MB por arquivo
- **Nomenclatura**: Padronizada com timestamp e ID do cliente
- **Estrutura de pastas**: `{clienteId}/{timestamp}_{nome_arquivo}`

## 🔄 Backup com Cloudflare Images

A estrutura está preparada para integração com Cloudflare Images:

```javascript
// Configuração futura
const cloudflareConfig = {
  accountId: 'seu-account-id',
  apiToken: 'seu-api-token',
  endpoint: 'https://api.cloudflare.com/client/v4/accounts/{account-id}/images/v1'
};

// Upload com backup automático
const resultado = await imagemNotaFiscalService.uploadImagem(
  arquivo,
  clienteId,
  pedidoId,
  metadados,
  { cloudflareBackup: true, cloudflareConfig }
);
```

## 🚨 Resolução de Problemas

### Erro: "Bucket não existe"
```javascript
// Execute para criar o bucket
await imagemNotaFiscalService.inicializarBucket();
```

### Erro: "Permission denied"
- Verifique se as políticas RLS estão configuradas
- Confirme se o usuário está autenticado
- Verifique se o `auth.uid()` corresponde ao `cliente_id`

### Erro: "File too large"
- Arquivos devem ter no máximo 10MB
- Comprima imagens antes do upload
- Use formatos otimizados (WEBP recomendado)

### Imagens não carregam
- Verifique se o bucket está configurado como público
- Confirme se a URL está correta
- Teste o acesso direto à URL da imagem

## 📈 Métricas e Monitoramento

O sistema gera automaticamente:
- **Total de imagens por cliente** (visível na tabela principal)
- **Status de upload** (processado, erro, pendente)
- **Histórico temporal** de uploads
- **Metadados de auditoria** (IP, User-Agent, timestamps)

## 🔧 Manutenção

### Limpeza de Arquivos Órfãos
```sql
-- Identificar imagens sem pedido associado
SELECT * FROM imagens_notas_fiscais 
WHERE pedido_id IS NOT NULL 
AND NOT EXISTS (
  SELECT 1 FROM pedidos_vendas 
  WHERE id = imagens_notas_fiscais.pedido_id
);
```

### Estatísticas de Uso
```sql
-- Resumo por cliente
SELECT 
  c.nome,
  COUNT(i.id) as total_imagens,
  SUM(i.tamanho_bytes) as total_bytes,
  MAX(i.created_at) as ultimo_upload
FROM clientes_fast c
LEFT JOIN imagens_notas_fiscais i ON c.id = i.cliente_id
GROUP BY c.id, c.nome
ORDER BY total_imagens DESC;
```

---

## 🎉 Resultado

Com essas implementações, o sistema agora:

1. **Armazena** todas as imagens de notas fiscais de forma segura
2. **Vincula** cada imagem ao cliente e pedido correspondente
3. **Permite** visualização completa no painel administrativo
4. **Mantém** histórico detalhado para auditoria
5. **Oferece** interface intuitiva para gerenciamento
6. **Prepara** para backup com Cloudflare Images

O administrador pode agora verificar qualquer imprevisto acessando o histórico completo de imagens de cada cliente através do botão "Ver detalhes" (👁️) na tabela de usuários.
