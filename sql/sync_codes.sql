-- Script para sincronizar códigos de resgate
-- Garantir que a coluna codigo_resgate existe
ALTER TABLE resgates ADD COLUMN IF NOT EXISTS codigo_resgate VARCHAR(20);

-- Remover constraint única temporariamente para permitir updates
ALTER TABLE resgates DROP CONSTRAINT IF EXISTS resgates_codigo_resgate_key;

-- Criar função para gerar código de resgate se não existir
CREATE OR REPLACE FUNCTION generate_rescue_code() RETURNS TEXT AS $$
DECLARE
    codigo TEXT;
    existe BOOLEAN;
BEGIN
    LOOP
        -- Gerar código no formato RES-YYYYMMDD-NNNN
        codigo := 'RES-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        
        -- Verificar se o código já existe
        SELECT EXISTS(SELECT 1 FROM resgates WHERE codigo_resgate = codigo) INTO existe;
        
        -- Se não existe, usar este código
        IF NOT existe THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN codigo;
END;
$$ LANGUAGE plpgsql;

-- Atualizar TODOS os resgates para ter códigos únicos
UPDATE resgates 
SET codigo_resgate = 'RES-' || TO_CHAR(created_at, 'YYYYMMDD') || '-' || LPAD((ROW_NUMBER() OVER (ORDER BY created_at))::TEXT, 4, '0')
WHERE codigo_resgate IS NULL OR codigo_resgate = '';

-- Adicionar constraint única após atualização
ALTER TABLE resgates ADD CONSTRAINT resgates_codigo_resgate_unique UNIQUE (codigo_resgate);

-- Adicionar trigger para gerar código automaticamente em novos resgates
CREATE OR REPLACE FUNCTION set_rescue_code() 
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.codigo_resgate IS NULL THEN
        NEW.codigo_resgate := generate_rescue_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger se não existir
DROP TRIGGER IF EXISTS trigger_set_rescue_code ON resgates;
CREATE TRIGGER trigger_set_rescue_code
    BEFORE INSERT ON resgates
    FOR EACH ROW
    EXECUTE FUNCTION set_rescue_code();

-- Verificar resultados
SELECT id, codigo_resgate, created_at 
FROM resgates 
ORDER BY created_at DESC 
LIMIT 10;
