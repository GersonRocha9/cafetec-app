// =====================================================
// FORMATTERS & HELPERS
// =====================================================

/**
 * Formata um número para moeda brasileira
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Formata data no padrão brasileiro (DD/MM/AAAA)
 */
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR').format(dateObj)
}

/**
 * Formata data com hora (DD/MM/AAAA HH:mm)
 */
export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(dateObj)
}

/**
 * Converte data de DD/MM/AAAA para AAAA-MM-DD (ISO)
 */
export const formatDateToISO = (date: string): string => {
  const [day, month, year] = date.split('/')
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

/**
 * Converte data de AAAA-MM-DD (ISO) para DD/MM/AAAA
 */
export const formatDateFromISO = (date: string): string => {
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}

/**
 * Formata número de hectares
 */
export const formatHectares = (value: number): string => {
  return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ha`
}

/**
 * Formata quilogramas
 */
export const formatKilograms = (value: number): string => {
  return `${value.toLocaleString('pt-BR')} kg`
}

/**
 * Formata porcentagem
 */
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`
}

/**
 * Trunca texto longo
 */
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

/**
 * Obtém cor baseada no status do talhão
 */
export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    'Pronto para Colheita': '#4CAF50',
    'Aguardando Colheita': '#FF9800',
    Colhido: '#2196F3',
    'Em Manutenção': '#9E9E9E',
  }
  return statusColors[status] || '#757575'
}

/**
 * Valida CPF
 */
export const isValidCPF = (cpf: string): boolean => {
  cpf = cpf.replace(/[^\d]/g, '')
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i)
  }
  let digit = 11 - (sum % 11)
  if (digit >= 10) digit = 0
  if (digit !== parseInt(cpf.charAt(9))) return false

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i)
  }
  digit = 11 - (sum % 11)
  if (digit >= 10) digit = 0
  if (digit !== parseInt(cpf.charAt(10))) return false

  return true
}

/**
 * Formata telefone
 */
export const formatPhone = (phone: string): string => {
  phone = phone.replace(/[^\d]/g, '')
  if (phone.length === 11) {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  } else if (phone.length === 10) {
    return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  return phone
}

/**
 * Formata CEP
 */
export const formatCEP = (cep: string): string => {
  cep = cep.replace(/[^\d]/g, '')
  if (cep.length === 8) {
    return cep.replace(/(\d{5})(\d{3})/, '$1-$2')
  }
  return cep
}
