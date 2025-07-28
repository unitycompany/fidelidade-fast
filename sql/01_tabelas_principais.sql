-- ====================================
-- PARTE 1: EXTENSÕES E TABELAS PRINCIPAIS
-- ====================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================
-- 1. TABELA DE CLIENTES FAST
-- ====================================
CREATE TABLE clientes_fast (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cpf_cnpj VARCHAR(18) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefone VARCHAR(20),
  tipo VARCHAR(10) CHECK (tipo IN ('CPF', 'CNPJ')) NOT NULL,
  endereco TEXT,
  cidade VARCHAR(100),
  estado VARCHAR(2),
  cep VARCHAR(10),
  
  -- Controle de pontos
  saldo_pontos INTEGER DEFAULT 0,
  total_pontos_ganhos INTEGER DEFAULT 0,
  total_pontos_gastos INTEGER DEFAULT 0,
  
  -- Status e controle
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'bloqueado')),
  data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ultima_atividade TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- 2. TABELA DE FORNECEDORES/DISTRIBUIDORES
-- ====================================
CREATE TABLE fornecedores_fast (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cnpj VARCHAR(18) UNIQUE NOT NULL,
  razao_social VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255),
  endereco TEXT,
  cidade VARCHAR(100),
  estado VARCHAR(2),
  
  -- Status
  ativo BOOLEAN DEFAULT true,
  autorizado_fast BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
