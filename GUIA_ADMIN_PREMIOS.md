# Guia de Administração - Catálogo de Prêmios

## 📚 Visão Geral

O **Catálogo de Prêmios** é a seção do painel administrativo responsável por gerenciar todos os prêmios disponíveis no **Clube Fast de Recompensas**. Este sistema permite controle completo sobre o catálogo, desde a criação até a análise de performance dos prêmios.

## 🎯 Funcionalidades Principais

### 1. **CRUD Completo de Prêmios**
- ✅ **Criar** novos prêmios
- ✅ **Visualizar** catálogo completo
- ✅ **Editar** prêmios existentes
- ✅ **Excluir** prêmios (com confirmação)
- ✅ **Ativar/Desativar** prêmios

### 2. **Sistema de Categorias**
```javascript
CATEGORIAS_PREMIOS = {
    ferramentas_premium: 'Ferramentas Premium',
    ferramentas: 'Ferramentas',
    vale_compras: 'Vale-Compras', 
    brindes: 'Brindes',
    capacitacao: 'Capacitação'
}
```

### 3. **Dashboard de Estatísticas**
- 📊 Total de prêmios no catálogo
- ✅ Prêmios ativos vs inativos
- ⭐ Prêmios em destaque
- 📈 Análise por categoria

### 4. **Sistema de Filtros Avançados**
- 🔍 **Busca textual** (nome/descrição)
- 🏷️ **Filtro por categoria**
- 📊 **Filtro por status** (Ativo/Inativo)
- ⭐ **Identificação visual** de prêmios em destaque

## 🏗️ Estrutura de Dados

### Campos do Prêmio
```sql
premios_catalogo:
├── id (UUID) - Identificador único
├── nome (VARCHAR) - Nome do prêmio *obrigatório
├── descricao (TEXT) - Descrição detalhada
├── categoria (VARCHAR) - Categoria do prêmio *obrigatório
├── pontos_necessarios (INTEGER) - Pontos para resgatar *obrigatório
├── valor_estimado (DECIMAL) - Valor comercial estimado
├── estoque_disponivel (INTEGER) - Quantidade em estoque
├── estoque_ilimitado (BOOLEAN) - Se tem estoque ilimitado
├── ativo (BOOLEAN) - Se o prêmio está ativo
├── destaque (BOOLEAN) - Se aparece em destaque
├── ordem_exibicao (INTEGER) - Ordem na listagem
├── imagem_url (TEXT) - URL da imagem do prêmio
├── created_at (TIMESTAMP) - Data de criação
└── updated_at (TIMESTAMP) - Data da última atualização
```

## 💎 Catálogo Inicial Padrão

### **Ferramentas Premium** (10.000 - 4.500 pontos)
| Prêmio | Pontos | Valor | Descrição |
|--------|--------|-------|-----------|
| Nível Laser Profissional | 10.000 | R$ 500,00 | Alcance 30m, ideal para drywall |
| Parafusadeira Elétrica Fast | 8.000 | R$ 350,00 | Torque ajustável |
| Kit Furadeira + Brocas SDS | 7.500 | R$ 320,00 | Completo para concreto |
| Serra Tico-Tico Profissional | 6.000 | R$ 280,00 | Lâminas para drywall |
| Esquadro Magnético 12" | 4.500 | R$ 180,00 | Para soldas e montagens |

### **Ferramentas Intermediárias** (3.000 - 1.200 pontos)
| Prêmio | Pontos | Valor | Descrição |
|--------|--------|-------|-----------|
| Trena Digital 5m | 3.000 | R$ 120,00 | Precisão profissional |
| Kit Chaves Philips e Fenda | 2.500 | R$ 80,00 | Várias medidas |
| Martelo de Borracha | 2.000 | R$ 60,00 | Para ajustes finos |
| Estilete Profissional | 1.500 | R$ 45,00 | Lâminas reforçadas |
| Régua de Alumínio 2m | 1.200 | R$ 35,00 | Cortes retos |

### **Vale-Compras** (4.000 - 1.000 pontos)
| Prêmio | Pontos | Valor | Estoque |
|--------|--------|-------|---------|
| Vale-Compras R$ 200,00 | 4.000 | R$ 200,00 | Ilimitado |
| Vale-Compras R$ 100,00 | 2.000 | R$ 100,00 | Ilimitado |
| Vale-Compras R$ 50,00 | 1.000 | R$ 50,00 | Ilimitado |

### **Brindes** (1.200 - 300 pontos)
| Prêmio | Pontos | Valor | Estoque |
|--------|--------|-------|---------|
| Camiseta Fast Sistemas | 1.200 | R$ 45,00 | 50 un |
| Boné Fast Sistemas | 1.000 | R$ 35,00 | 60 un |
| Caneca Térmica Fast | 800 | R$ 25,00 | 80 un |
| Chaveiro Nível de Bolha | 500 | R$ 15,00 | 100 un |
| Kit Adesivos Fast | 300 | R$ 10,00 | 200 un |

### **Capacitação** (8.000 - 3.500 pontos)
| Prêmio | Pontos | Valor | Estoque |
|--------|--------|-------|---------|
| Workshop Presencial | 8.000 | R$ 400,00 | 3 vagas |
| Curso Online Glasroc X | 5.000 | R$ 200,00 | Ilimitado |
| Curso Online Drywall Básico | 3.500 | R$ 150,00 | Ilimitado |

## 🔧 Como Usar o Painel

### **1. Acessar o Catálogo**
1. Faça login como administrador
2. Vá para **"Painel Admin"**
3. Clique na aba **"Catálogo de Prêmios"**

### **2. Criar Novo Prêmio**
1. Clique em **"Novo Prêmio"**
2. Preencha os campos obrigatórios:
   - **Nome** (ex: "Furadeira Profissional")
   - **Categoria** (selecione da lista)
   - **Pontos Necessários** (ex: 5000)
3. Campos opcionais:
   - **Descrição** detalhada
   - **Valor Estimado** em reais
   - **Estoque** (ou marque "ilimitado")
   - **URL da Imagem**
4. Configure status:
   - ✅ **Ativo** (prêmio disponível)
   - ⭐ **Destaque** (aparece em destaque)
5. Clique em **"Criar Prêmio"**

### **3. Editar Prêmio Existente**
1. Localize o prêmio na lista
2. Clique no ícone de **edição** (✏️)
3. Modifique os campos necessários
4. Clique em **"Atualizar Prêmio"**

### **4. Ativar/Desativar Prêmio**
1. Localize o prêmio na lista
2. Clique no ícone de **visibilidade** (👁️)
3. Prêmios inativos não aparecem para os clientes

### **5. Filtrar e Buscar**
- **Busca**: Digite no campo de busca para filtrar por nome/descrição
- **Categoria**: Selecione categoria específica
- **Status**: Filtre por "Todos", "Ativos" ou "Inativos"

## 📊 Análise e Relatórios

### **Dashboard de Estatísticas**
- **Total de Prêmios**: Quantidade total no catálogo
- **Prêmios Ativos**: Disponíveis para resgate
- **Prêmios Inativos**: Temporariamente indisponíveis
- **Em Destaque**: Prêmios promovidos

### **Informações por Prêmio**
- 🎯 **Pontos necessários** para resgate
- 💰 **Valor estimado** do prêmio
- 📦 **Status do estoque** (limitado/ilimitado)
- ⭐ **Indicador de destaque**
- 📊 **Status ativo/inativo**

## ⚡ Automação e Inicialização

### **Inicialização Automática**
O sistema automaticamente:
- ✅ Verifica se o catálogo já foi inicializado
- ✅ Popula com prêmios padrão se vazio
- ✅ Configura categorias e pontuações
- ✅ Define prêmios em destaque

### **Script de Inicialização**
```javascript
// Executado automaticamente no App.jsx
import { inicializarPremios } from './utils/inicializarPremios'

// Verifica e inicializa se necessário
await inicializarPremios()
```

## 🔗 Integração com Sistema

### **Conexão com Resgates**
- Prêmios ativos aparecem na interface do cliente
- Sistema valida pontos suficientes antes do resgate
- Controle de estoque automático
- Histórico de resgates vinculado ao prêmio

### **Sincronização com Banco**
- Operações em tempo real via Supabase
- Backup automático de alterações
- Controle de concorrência
- Logs de auditoria

## 🛡️ Segurança e Validações

### **Validações de Campo**
- ✅ Nome obrigatório e único
- ✅ Categoria válida da lista predefinida
- ✅ Pontos > 0
- ✅ Valor estimado ≥ 0
- ✅ Estoque ≥ 0 (se não ilimitado)

### **Confirmações de Segurança**
- ⚠️ Confirmação antes de excluir prêmio
- ⚠️ Validação de campos obrigatórios
- ⚠️ Feedback visual de ações realizadas

## 📈 Boas Práticas

### **Gestão de Catálogo**
1. **Mantenha atualizado**: Revise regularmente o catálogo
2. **Equilibre pontos**: Prêmios proporcionais ao valor
3. **Use destaques**: Promova prêmios estratégicos
4. **Controle estoque**: Monitore disponibilidade
5. **Categorize corretamente**: Facilita navegação do cliente

### **Estratégia de Pontuação**
- **Vale-compras**: 20 pontos por R$ 1,00 (1000 pts = R$ 50)
- **Ferramentas básicas**: 15-25 pontos por R$ 1,00
- **Ferramentas premium**: 20-30 pontos por R$ 1,00
- **Brindes**: 20-40 pontos por R$ 1,00
- **Capacitação**: 17-23 pontos por R$ 1,00

### **Gestão de Estoque**
- ✅ Marque **"estoque ilimitado"** para vale-compras e cursos online
- ✅ Defina **estoque real** para produtos físicos
- ✅ Monitore **estoque baixo** e reponha conforme necessário
- ✅ **Desative temporariamente** prêmios em falta

---

## 🎉 Conclusão

O **Catálogo de Prêmios** é uma ferramenta poderosa para:
- 🎯 **Engajar clientes** com prêmios atrativos
- 📊 **Controlar custos** com pontuação estratégica  
- 🔧 **Gerenciar facilmente** todo o catálogo
- 📈 **Analisar performance** dos prêmios

O sistema foi projetado para ser **intuitivo**, **seguro** e **escalável**, permitindo que a Fast Sistemas ofereça um programa de fidelidade completo e profissional.

---

*Última atualização: Janeiro 2025*
*Versão: 2.0 - Sistema Completo de Prêmios*
