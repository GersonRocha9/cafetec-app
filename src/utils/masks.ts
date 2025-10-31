/**
 * Utilitários de máscaras para inputs
 */

/**
 * Aplica máscara de data DD/MM/YYYY
 */
export function applyDateMask(value: string): string {
  const numbers = value.replace(/\D/g, '')

  if (numbers.length <= 2) {
    return numbers
  }
  if (numbers.length <= 4) {
    return `${numbers.slice(0, 2)}/${numbers.slice(2)}`
  }
  return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`
}

/**
 * Valida se a data está no formato correto e é válida
 */
export function isValidDate(dateString: string): boolean {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    return false
  }

  const [day, month, year] = dateString.split('/').map(Number)

  if (year < 1900 || year > 2100) return false
  if (month < 1 || month > 12) return false
  if (day < 1 || day > 31) return false

  // Verificar dias do mês
  const daysInMonth = new Date(year, month, 0).getDate()
  if (day > daysInMonth) return false

  return true
}

/**
 * Converte data DD/MM/YYYY para YYYY-MM-DD (formato ISO)
 */
export function dateToISO(dateString: string): string {
  const [day, month, year] = dateString.split('/')
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

/**
 * Converte data YYYY-MM-DD para DD/MM/YYYY
 */
export function dateFromISO(isoDate: string): string {
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}

/**
 * Aplica máscara de moeda brasileira (R$ 0.000,00)
 */
export function applyCurrencyMask(value: string): string {
  const numbers = value.replace(/\D/g, '')

  if (!numbers) return ''

  const amount = Number(numbers) / 100

  return amount.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Remove máscara de moeda e retorna número
 */
export function removeCurrencyMask(value: string): number {
  const numbers = value.replace(/\D/g, '')
  return Number(numbers) / 100
}

/**
 * Aplica máscara de número decimal (0.000,00)
 */
export function applyDecimalMask(value: string, decimals: number = 2): string {
  const numbers = value.replace(/\D/g, '')

  if (!numbers) return ''

  const divider = Math.pow(10, decimals)
  const amount = Number(numbers) / divider

  return amount.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * Remove máscara de decimal e retorna número
 */
export function removeDecimalMask(value: string): number {
  return Number(value.replace(/\./g, '').replace(',', '.'))
}

/**
 * Aplica máscara de número inteiro (apenas números)
 */
export function applyIntegerMask(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Valida se o valor é um número válido
 */
export function isValidNumber(value: string): boolean {
  const num = removeDecimalMask(value)
  return !isNaN(num) && num > 0
}

/**
 * Valida se a data não é futura
 */
export function isNotFutureDate(dateString: string): boolean {
  if (!isValidDate(dateString)) return false

  const [day, month, year] = dateString.split('/').map(Number)
  const inputDate = new Date(year, month - 1, day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return inputDate <= today
}

/**
 * Valida se a data está dentro de um range aceitável (último ano até próximos 2 anos)
 */
export function isDateInValidRange(dateString: string): boolean {
  if (!isValidDate(dateString)) return false

  const [day, month, year] = dateString.split('/').map(Number)
  const inputDate = new Date(year, month - 1, day)
  const today = new Date()

  const oneYearAgo = new Date(today)
  oneYearAgo.setFullYear(today.getFullYear() - 1)

  const twoYearsAhead = new Date(today)
  twoYearsAhead.setFullYear(today.getFullYear() + 2)

  return inputDate >= oneYearAgo && inputDate <= twoYearsAhead
}
