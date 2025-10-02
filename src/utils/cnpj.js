const onlyDigits = (value = '') => (value || '').toString().replace(/\D+/g, '')

export const digitsOnly = (value = '') => onlyDigits(value)

export const normalizeCnpj = (value = '') => {
  const digits = onlyDigits(value).slice(0, 14)
  return digits.length === 14 ? digits : null
}

export const formatCnpj = (value = '') => {
  const digits = onlyDigits(value).slice(0, 14)
  if (digits.length !== 14) {
    return digits
  }
  return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

// Validação de CNPJ (algoritmo oficial)
// 1. Normaliza e rejeita sequências repetidas.
// 2. Calcula primeiro dígito com pesos 5,4,3,2,9,8,7,6,5,4,3,2.
// 3. Calcula segundo dígito com pesos 6,5,4,3,2,9,8,7,6,5,4,3,2.
// (Implementação com laço genérico reiniciando peso em 9 quando <2)
export const validateCnpj = (value = '') => {
  // Normaliza para apenas dígitos e garante 14 caracteres
  const cnpj = normalizeCnpj(value)
  if (!cnpj) return false

  // Rejeita sequências repetidas (ex: 00000000000000)
  if (/^(\d)\1{13}$/.test(cnpj)) return false

  // Algoritmo oficial: pesos decrescentes reiniciando em 9
  const calcDigit = (base) => {
    let soma = 0
    let pos = base.length - 7 // para 12 dígitos -> 5; para 13 -> 6
    for (let i = base.length; i >= 1; i--) {
      const idx = base.length - i
      soma += parseInt(base.charAt(idx), 10) * pos--
      if (pos < 2) pos = 9
    }
    const resto = soma % 11
    return (resto < 2) ? 0 : 11 - resto
  }

  const base12 = cnpj.substring(0, 12)
  const d1 = calcDigit(base12)
  const d2 = calcDigit(base12 + d1)
  return cnpj.endsWith(`${d1}${d2}`)
}

export default {
  digitsOnly,
  normalizeCnpj,
  formatCnpj,
  validateCnpj
}
