-- Adicionar campo codigo_resgate na tabela resgates
ALTER TABLE resgates ADD COLUMN IF NOT EXISTS codigo_resgate VARCHAR(20) UNIQUE;

-- Adicionar campos necessários que podem estar faltando
ALTER TABLE resgates ADD COLUMN IF NOT EXISTS coletado BOOLEAN DEFAULT FALSE;
ALTER TABLE resgates ADD COLUMN IF NOT EXISTS data_coleta TIMESTAMP WITH TIME ZONE;
ALTER TABLE resgates ADD COLUMN IF NOT EXISTS pontos_utilizados INTEGER;

-- Atualizar campo pontos_utilizados com base em pontos_gastos (caso exista)
UPDATE resgates SET pontos_utilizados = pontos_gastos WHERE pontos_utilizados IS NULL;

-- Criar função para gerar código de resgate automático
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

-- Adicionar trigger para gerar código automaticamente
CREATE OR REPLACE FUNCTION set_rescue_code() 
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.codigo_resgate IS NULL THEN
        NEW.codigo_resgate := generate_rescue_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_set_rescue_code ON resgates;
CREATE TRIGGER trigger_set_rescue_code
    BEFORE INSERT ON resgates
    FOR EACH ROW
    EXECUTE FUNCTION set_rescue_code();

-- Atualizar resgates existentes que não têm código
UPDATE resgates 
SET codigo_resgate = generate_rescue_code()
WHERE codigo_resgate IS NULL;
