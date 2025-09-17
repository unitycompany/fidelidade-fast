-- Cria lista de CPFs bloqueados para cadastro
-- Executar uma vez no Supabase

create table if not exists public.cpf_nao_valido (
  cpf varchar(11) primary key,
  motivo text,
  criado_em timestamp with time zone default now()
);

-- Opcional: política RLS simples (permitir leitura para todos e escrita apenas por admin)
-- alter table public.cpf_nao_valido enable row level security;
-- create policy "cpfs_bloqueados_leitura" on public.cpf_nao_valido for select using (true);
-- create policy "cpfs_bloqueados_admin" on public.cpf_nao_valido for all using ( auth.role() = 'service_role' );
