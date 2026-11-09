const MONTHS_ES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
]

/**
 * Formatea números de forma determinista (independiente del locale del
 * runtime) para evitar desajustes de hidratación entre servidor y cliente.
 */
export function formatNumber(value: number | null | undefined): string {
  const n = Math.trunc(value || 0)
  const negative = n < 0
  const digits = Math.abs(n).toString()
  let out = ''
  for (let i = 0; i < digits.length; i++) {
    if (i > 0 && (digits.length - i) % 3 === 0) out += '.'
    out += digits[i]
  }
  return `${negative ? '-' : ''}${out}`
}

/**
 * Formatea una fecha ISO en formato largo es-CO usando UTC, para que el
 * resultado sea idéntico en el servidor y en el navegador.
 */
export function formatDateLong(iso: string | null | undefined): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getUTCDate()} de ${MONTHS_ES[date.getUTCMonth()]} de ${date.getUTCFullYear()}`
}
