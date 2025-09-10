# ====================================
# SCRIPT PARA ATUALIZAÇÃO DE SEGURANÇA DO SUPABASE
# ====================================
# Este script deve ser executado para configurar as políticas de segurança RLS
# nas tabelas do Supabase conforme as melhores práticas.

import os
from dotenv import load_dotenv
import requests
import json

# Carregar variáveis de ambiente
load_dotenv()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")  # Chave de serviço (não a anon key)

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("⚠️ Configuração incompleta. Defina VITE_SUPABASE_URL e SUPABASE_SERVICE_KEY no .env")
    exit(1)

# Headers para API
headers = {
    "apikey": SUPABASE_SERVICE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    "Content-Type": "application/json"
}

# =================================
# FUNÇÃO PARA EXECUTAR SQL
# =================================
def execute_sql(sql_query):
    endpoint = f"{SUPABASE_URL}/rest/v1/rpc/execute_sql"
    payload = {
        "query": sql_query
    }
    
    response = requests.post(endpoint, headers=headers, json=payload)
    
    if response.status_code == 200:
        print(f"✅ SQL executado com sucesso")
        return response.json()
    else:
        print(f"❌ Erro ao executar SQL: {response.status_code}")
        print(response.text)
        return None

# =================================
# POLÍTICAS DE SEGURANÇA
# =================================
# Lista de SQLs para aplicar as políticas de segurança

# 1. Ativar RLS em todas as tabelas
enable_rls_sql = """
-- Ativar RLS em todas as tabelas principais
ALTER TABLE clientes_fast ENABLE ROW LEVEL SECURITY;
ALTER TABLE resgates ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_pontos ENABLE ROW LEVEL SECURITY;
ALTER TABLE premios ENABLE ROW LEVEL SECURITY;
ALTER TABLE imagens_notas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos_elegiveis ENABLE ROW LEVEL SECURITY;
"""

# 2. Políticas para clientes_fast
clientes_policies_sql = """
-- Política para clientes visualizarem apenas seus próprios dados
CREATE POLICY IF NOT EXISTS "Clientes visualizam apenas seus dados" 
ON clientes_fast FOR SELECT 
USING (auth.uid() = id::text OR auth.jwt() ->> 'role' IN ('gerente', 'admin_supremo'));

-- Política para clientes atualizarem apenas seus próprios dados
CREATE POLICY IF NOT EXISTS "Clientes atualizam apenas seus dados" 
ON clientes_fast FOR UPDATE 
USING (auth.uid() = id::text OR auth.jwt() ->> 'role' IN ('gerente', 'admin_supremo'))
WITH CHECK (auth.uid() = id::text OR auth.jwt() ->> 'role' IN ('gerente', 'admin_supremo'));
"""

# 3. Políticas para resgates
resgates_policies_sql = """
-- Política para clientes visualizarem seus próprios resgates
CREATE POLICY IF NOT EXISTS "Clientes visualizam seus resgates" 
ON resgates FOR SELECT 
USING (auth.uid() = cliente_id::text OR auth.jwt() ->> 'role' IN ('gerente', 'admin_supremo'));

-- Política para gerentes gerenciarem resgates
CREATE POLICY IF NOT EXISTS "Gerentes gerenciam resgates" 
ON resgates FOR ALL 
USING (auth.jwt() ->> 'role' IN ('gerente', 'admin_supremo'));

-- Política para clientes criarem seus próprios resgates
CREATE POLICY IF NOT EXISTS "Clientes criam seus resgates" 
ON resgates FOR INSERT 
WITH CHECK (auth.uid() = cliente_id::text);
"""

# 4. Políticas para histórico de pontos
historico_policies_sql = """
-- Política para visualização de histórico
CREATE POLICY IF NOT EXISTS "Visualização de histórico de pontos" 
ON historico_pontos FOR SELECT 
USING (auth.uid() = cliente_id::text OR auth.jwt() ->> 'role' IN ('gerente', 'admin_supremo'));

-- Política para inserção no histórico
CREATE POLICY IF NOT EXISTS "Inserção no histórico" 
ON historico_pontos FOR INSERT 
WITH CHECK (auth.uid() = cliente_id::text OR auth.jwt() ->> 'role' IN ('gerente', 'admin_supremo'));
"""

# 5. Políticas para imagens de notas
imagens_policies_sql = """
-- Política para visualização de imagens
CREATE POLICY IF NOT EXISTS "Visualização de imagens" 
ON imagens_notas FOR SELECT 
USING (auth.uid() = cliente_id::text OR auth.jwt() ->> 'role' IN ('gerente', 'admin_supremo'));

-- Política para upload de imagens
CREATE POLICY IF NOT EXISTS "Upload de imagens" 
ON imagens_notas FOR INSERT 
WITH CHECK (auth.uid() = cliente_id::text OR auth.jwt() ->> 'role' IN ('admin_supremo'));

-- Política para armazenamento
CREATE POLICY IF NOT EXISTS "storage.imagens_notas policy"
ON storage.objects FOR ALL
USING (bucket_id = 'imagens_notas' AND (auth.role() = 'authenticated' OR auth.role() = 'service_role'))
WITH CHECK (bucket_id = 'imagens_notas' AND (auth.role() = 'authenticated' OR auth.role() = 'service_role'));
"""

# =================================
# EXECUTAR ATUALIZAÇÕES
# =================================

print("🔒 Aplicando políticas de segurança ao banco de dados...")

# Executar os SQLs
execute_sql(enable_rls_sql)
execute_sql(clientes_policies_sql)
execute_sql(resgates_policies_sql)
execute_sql(historico_policies_sql)
execute_sql(imagens_policies_sql)

print("✅ Políticas de segurança aplicadas com sucesso!")
print("🔐 Seu banco de dados agora está protegido com RLS (Row Level Security)")
