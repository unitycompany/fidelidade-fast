# Sistema de Controle de Acesso - Sistema de Fidelidade Fast

## 📋 Visão Geral

O sistema agora possui **3 níveis de acesso** com permissões específicas para cada tipo de usuário:

- **👤 Cliente**: Acesso básico ao sistema
- **👨‍💼 Gerente**: Permissões de cliente + administração de resgates  
- **👨‍💻 Admin**: Acesso total ao sistema

---

## 🔐 Níveis de Acesso

### 👤 CLIENTE
**Permissões:**
- ✅ Enviar Nota
- ✅ Visualizar Prêmios
- ✅ Visualizar Meus Resgates (se houver)

**Páginas Acessíveis:**
- `/upload` - Envio de notas
- `/premios` - Catálogo de prêmios
- `/meus-resgates` - Histórico pessoal de resgates

---

### 👨‍💼 GERENTE
**Permissões:**
- ✅ Todas as permissões de Cliente
- ✅ Administração de Resgates (aprovar/rejeitar)

**Páginas Acessíveis:**
- `/upload` - Envio de notas
- `/premios` - Catálogo de prêmios  
- `/gerente-resgates` - Administração de resgates
- `/meus-resgates` - Histórico pessoal de resgates

---

### 👨‍💻 ADMIN
**Permissões:**
- ✅ Acesso total ao sistema
- ✅ Gerenciamento de usuários
- ✅ Configurações do sistema
- ✅ Relatórios e estatísticas

**Páginas Acessíveis:**
- `/admin-config` - Configuração de pontos
- `/admin-resgates` - Administração de resgates
- `/admin-catalogo` - Gerenciamento do catálogo de prêmios
- `/admin-estatisticas` - Relatórios e estatísticas
- `/admin-usuarios` - **NOVA** - Gerenciamento de usuários

---

## 🆕 Nova Funcionalidade: Gerenciamento de Usuários

### 📍 Página: `/admin-usuarios`
**Acesso:** Apenas para administradores

**Funcionalidades:**
- 👥 **Visualizar todos os usuários** cadastrados no sistema
- 🔍 **Pesquisar usuários** por nome, email ou CPF
- ✏️ **Editar informações** dos usuários
- 🎭 **Alterar nível de acesso** (cliente/gerente/admin)
- 🗑️ **Desativar/ativar usuários**
- ➕ **Adicionar novos usuários** ao sistema

**Campos de Pesquisa:**
- Nome do usuário
- Email
- CPF/CNPJ
- Role/Nível de acesso

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: `clientes_fast`
```sql
-- Campo role adicionado
role VARCHAR(20) DEFAULT 'cliente' 
CHECK (role IN ('admin', 'gerente', 'cliente'))
```

**Valores possíveis para role:**
- `'cliente'` - Usuário padrão
- `'gerente'` - Gerente de loja
- `'admin'` - Administrador do sistema

---

## 🚀 Como Configurar

### 1. Executar Script SQL
Execute o arquivo: `sql/16_add_roles_sistema.sql`

```sql
-- Este script irá:
-- ✅ Adicionar coluna 'role' na tabela clientes_fast
-- ✅ Criar constraint para valores válidos
-- ✅ Adicionar índices para performance
-- ✅ Criar usuários de exemplo
```

### 2. Usuários de Exemplo Criados
Após executar o script, você terá:

```
👨‍💻 Admin Sistema
Email: admin@fastsistemas.com.br
Senha: admin123
Role: admin

👨‍💼 Gerente Loja 1  
Email: gerente1@loja.com
Senha: gerente123
Role: gerente

👨‍💼 Gerente Loja 2
Email: gerente2@loja.com  
Senha: gerente123
Role: gerente
```

---

## 🔄 Migração de Usuários Existentes

### Usuários Existentes
- **Todos os usuários existentes** são automaticamente definidos como `'cliente'`
- **Usuários com `is_admin = true`** são automaticamente promovidos para `'admin'`
- **Compatibilidade mantida** com sistema anterior

### Promover Usuário para Admin
```sql
UPDATE clientes_fast 
SET role = 'admin' 
WHERE email = 'seu@email.com';
```

### Promover Usuário para Gerente  
```sql
UPDATE clientes_fast 
SET role = 'gerente' 
WHERE email = 'gerente@email.com';
```

---

## 🎯 Funcionalidades da Interface

### Navigation Sidebar
A sidebar agora mostra itens diferentes baseado no role:

**Cliente:**
- 📤 Enviar Nota
- 🎁 Prêmios
- ⭐ Meus Resgates (se houver)

**Gerente:**
- 📤 Enviar Nota  
- 🎁 Prêmios
- ⚙️ Resgates Admin
- ⭐ Meus Resgates (se houver)

**Admin:**
- 💰 Configuração de Pontos
- ⚙️ Resgates Admin
- 🎁 Catálogo de Prêmios
- 📊 Estatísticas
- 👥 **Usuários** ← NOVA!

---

## 🔒 Segurança

### Verificação de Permissões
- ✅ **Frontend**: Interface adaptada baseada no role
- ✅ **Rotas protegidas**: Páginas verificam permissões antes de renderizar
- ✅ **Feedback de acesso negado**: Mensagem clara quando acesso é negado

### Função de Verificação
```javascript
const temPermissao = (permissaoRequerida) => {
  const userRole = user?.role || 'cliente'
  
  switch (permissaoRequerida) {
    case 'cliente':
      return ['cliente', 'gerente', 'admin'].includes(userRole)
    case 'gerente':
      return ['gerente', 'admin'].includes(userRole)
    case 'admin':
      return userRole === 'admin'
    default:
      return false
  }
}
```

---

## 📱 Layout Mantido

✅ **Interface idêntica** - Nenhuma alteração visual no layout
✅ **Responsividade preservada** - Funciona em desktop e mobile
✅ **Tema mantido** - Cores e estilos inalterados
✅ **UX consistente** - Mesma experiência de usuário

---

## 🚨 Notas Importantes

1. **Backward Compatibility**: Sistema mantém compatibilidade com usuários existentes
2. **Database Table**: Utiliza a tabela `clientes_fast` existente, sem criar novas tabelas
3. **Role Default**: Novos usuários são criados como `'cliente'` por padrão
4. **Admin Override**: Administradores podem alterar qualquer usuário
5. **Security First**: Todas as rotas verificam permissões antes de renderizar

---

## ✅ Status da Implementação

- [x] Criação do sistema de roles no banco
- [x] Modificação do App.jsx para controle de acesso
- [x] Atualização da Sidebar com itens baseados em role
- [x] Integração com componente AdminUsuarios existente
- [x] Verificação de permissões em todas as rotas
- [x] Preservação total do layout original
- [x] Documentação completa do sistema

**🎉 Sistema de controle de acesso implementado com sucesso!**
