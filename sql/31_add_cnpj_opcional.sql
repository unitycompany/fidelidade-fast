-- Add optional CNPJ field to clientes_fast to store customer's secondary/company document
-- This column is NOT unique, as multiple customers could leave it empty or share older data; app enforces uniqueness on insert.
-- Safe to run multiple times: checks existence before adding.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'clientes_fast'
      AND column_name = 'cnpj_opcional'
  ) THEN
    ALTER TABLE public.clientes_fast
      ADD COLUMN cnpj_opcional VARCHAR(18);
  END IF;
END $$;

-- Optional: index to speed up lookups by CNPJ
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'idx_clientes_cnpj_opcional'
  ) THEN
    CREATE INDEX idx_clientes_cnpj_opcional ON public.clientes_fast(cnpj_opcional);
  END IF;
END $$;
