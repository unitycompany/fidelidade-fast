-- =============================================
-- VERIFICAR CLIENTES REAIS PARA TESTE
-- Execute este script no SQL Editor do Supabase
-- =============================================

-- 1. Primeiro verificar estrutura da tabela
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'clientes_fast' 
ORDER BY ordinal_position;

-- 2. Listar todos os clientes disponíveis
SELECT 
  id,
  nome,
  email,
  telefone,
  data_cadastro
FROM clientes_fast 
ORDER BY data_cadastro DESC
LIMIT 10;

-- 3. Contar total de clientes
SELECT COUNT(*) as total_clientes FROM clientes_fast;

-- 4. Se não houver clientes, criar um cliente de teste
DO $$
DECLARE
    cliente_count INTEGER;
    novo_cliente_id UUID;
BEGIN
    -- Verificar se existem clientes
    SELECT COUNT(*) INTO cliente_count FROM clientes_fast;
    
    IF cliente_count = 0 THEN
        -- Gerar novo UUID para cliente de teste
        novo_cliente_id := gen_random_uuid();
        
        -- Inserir cliente de teste (sem pontos_atuais)
        INSERT INTO clientes_fast (
            id,
            nome,
            email,
            telefone,
            data_cadastro
        ) VALUES (
            novo_cliente_id,
            'Cliente Teste Upload',
            'teste@upload.com',
            '11999999999',
            NOW()
        );
        
        RAISE NOTICE 'Cliente de teste criado com ID: %', novo_cliente_id;
        
        -- Mostrar o cliente criado
        SELECT 
            id,
            nome,
            email
        FROM clientes_fast 
        WHERE id = novo_cliente_id;
        
    END IF;
END $$;

-- 5. Mostrar o primeiro cliente disponível para usar no teste
SELECT 
    id as cliente_id_para_teste,
    nome,
    'Use este ID no componente de teste' as instrucao
FROM clientes_fast 
ORDER BY data_cadastro ASC
LIMIT 1;
