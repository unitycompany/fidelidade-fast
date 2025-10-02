// Helper utilities relacionados ao objeto de usuário/cliente
// Garantir que sempre utilizamos o campo cnpj_opcional como fonte única de CNPJ

export function getUserCnpj(user) {
  return user?.cnpj_opcional || null;
}

export function buildClientePayload(user) {
  if (!user) return null;
  return {
    id: user.id,
    nome: user.nome,
    email: user.email,
    telefone: user.telefone,
    cpf: user.cpf_cnpj,
    cnpj: getUserCnpj(user),
    loja: user.loja_nome || user.lojas?.nome || null,
    role: user.role || null
  };
}

export default { getUserCnpj, buildClientePayload };
