/** Validación básica de email (RFC simplificado) */
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

export function isValidEmail(value: string): boolean {
  const v = value.trim()
  if (!v) return false
  return EMAIL_REGEX.test(v)
}

/** Código de país ISO: 2 o 3 caracteres A-Z */
export function isValidCountryCode(value: string): boolean {
  const v = value.trim().toUpperCase()
  return /^[A-Z]{2,3}$/.test(v)
}

export function normalizeCountryCode(value: string): string {
  return value.trim().toUpperCase().slice(0, 3)
}

/** Acepta solo entrada numérica razonable (enteros/decimales, opcional negativo) */
export function parseAccountingNumberInput(raw: string): { ok: true; value: number } | { ok: false; reason: string } {
  const v = raw.replace(/,/g, '').trim()
  if (v === '' || v === '-') return { ok: true, value: 0 }
  if (!/^-?\d*\.?\d*$/.test(v)) {
    return { ok: false, reason: 'Solo se permiten números.' }
  }
  const n = Number(v)
  if (Number.isNaN(n)) return { ok: false, reason: 'Valor numérico no válido.' }
  return { ok: true, value: n }
}

/** Porcentaje mostrado 0-100 (estado de resultados – filas margen) */
export function parsePercentInput(raw: string): { ok: true; value: number } | { ok: false; reason: string } {
  const v = raw.replace(/,/g, '').trim()
  if (v === '' || v === '-' || v === '.') return { ok: true, value: 0 }
  if (!/^\d*\.?\d*$/.test(v)) {
    return { ok: false, reason: 'Solo números entre 0 y 100.' }
  }
  const n = parseFloat(v)
  if (Number.isNaN(n)) return { ok: false, reason: 'Porcentaje no válido.' }
  if (n < 0 || n > 100) {
    return { ok: false, reason: 'El porcentaje debe estar entre 0 y 100.' }
  }
  return { ok: true, value: n / 100 }
}

export function inputErrorClass(hasError: boolean): string {
  return hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''
}
