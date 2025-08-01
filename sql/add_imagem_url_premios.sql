-- =======================================================
-- ADICIONAR CAMPO IMAGEM_URL AOS PRÊMIOS
-- =======================================================
-- Adiciona campo para URL da imagem dos produtos
-- =======================================================

-- 1. Verificar se a coluna já existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'premios_catalogo' 
            AND column_name = 'imagem_url'
        ) 
        THEN 'Coluna imagem_url já existe'
        ELSE 'Coluna imagem_url será criada'
    END as status;

-- 2. Adicionar campo imagem_url se não existir
ALTER TABLE premios_catalogo 
ADD COLUMN IF NOT EXISTS imagem_url TEXT;

-- 3. Adicionar comentário para documentação
COMMENT ON COLUMN premios_catalogo.imagem_url IS 'URL da imagem do produto/prêmio';

-- 4. Verificar se foi criado com sucesso
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'premios_catalogo' 
AND column_name = 'imagem_url';

-- 5. Atualizar prêmios existentes com imagens placeholder (opcional)
-- Descomente se quiser adicionar imagens placeholder aos prêmios existentes
/*
UPDATE premios_catalogo 
SET imagem_url = 'https://via.placeholder.com/300x200?text=' || REPLACE(nome, ' ', '+')
WHERE imagem_url IS NULL OR imagem_url = '';
*/

SELECT 'Campo imagem_url adicionado com sucesso!' as resultado;
