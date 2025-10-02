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

export const validateCnpj = (value = '') => {
  const digits = normalizeCnpj(value)
  if (!digits) return false
  if (/^(\d)\1{13}$/.test(digits)) return false

  const calcDigit = (base) => {
    let len = base.length - 7
    let sum = 0
    let pos = len - 7
    for (let i = len; i >= 1; i--) {
      sum += parseInt(base.charAt(len - i), 10) * pos--
      if (pos < 2) pos = 9
    }
    const remainder = sum % 11
    return remainder < 2 ? 0 : 11 - remainder
  }

  const firstBase = digits.substring(0, 12)
  const firstDigit = calcDigit(firstBase)
  const secondDigit = calcDigit(firstBase + firstDigit)

  return digits.endsWith(`${firstDigit}${secondDigit}`)
}

export default {
  digitsOnly,
  normalizeCnpj,
  formatCnpj,
  validateCnpj
}
