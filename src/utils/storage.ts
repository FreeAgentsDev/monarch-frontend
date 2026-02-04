/**
 * Persistencia en localStorage para la demo.
 * Prefijo 'monarch-demo-' para evitar colisiones.
 */

const PREFIX = 'monarch-demo-'

export const STORAGE_KEYS = {
  DASHBOARD_KPIS: `${PREFIX}dashboard-kpis`,
  CUADRO_GENERAL: `${PREFIX}cuadro-general`,
  ESTADO_RESULTADOS: `${PREFIX}estado-resultados`,
  EXCHANGE_RATES: `${PREFIX}exchange-rates`,
  STATS: `${PREFIX}stats`,
  ORDERS: `${PREFIX}orders`,
  PAISES: `${PREFIX}paises`,
  INVERSIONISTAS: `${PREFIX}inversionistas`,
  INVERSIONISTA_TIENDAS: `${PREFIX}inversionista-tiendas`,
} as const

export const DEFAULT_EXCHANGE_RATES: Record<string, number> = {
  COP: 1,
  USD: 3800,
  EUR: 4170,
  CLP: 4.2,
  DOP: 64,
  CRC: 7.2,
}

function getItem<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.warn('No se pudo guardar en localStorage:', e)
  }
}

export const demoStorage = {
  get: getItem,
  set: setItem,
  remove: (key: string) => {
    try {
      localStorage.removeItem(key)
    } catch {
      // ignore
    }
  },
  clear: () => {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k))
  },
}

// Tipos para gestión de países e inversionistas
export interface Pais {
  id: string
  codigo: string
  nombre: string
  moneda: string
  activo: boolean
  orden?: number
}

export interface Inversionista {
  id: string
  nombre: string
  email: string
  telefono?: string
  activo: boolean
  notas?: string
  createdAt: string
  updatedAt: string
}

export interface InversionistaTienda {
  id: string
  inversionistaId: string
  paisCodigo: string
  shopId?: string
  storeName?: string
  activo: boolean
}

export const DEFAULT_PAISES: Pais[] = [
  { id: 'p1', codigo: 'CO', nombre: 'Colombia', moneda: 'COP', activo: true, orden: 1 },
  { id: 'p2', codigo: 'EC', nombre: 'Ecuador', moneda: 'USD', activo: true, orden: 2 },
  { id: 'p3', codigo: 'ES', nombre: 'España', moneda: 'EUR', activo: true, orden: 3 },
  { id: 'p4', codigo: 'US', nombre: 'Estados Unidos', moneda: 'USD', activo: true, orden: 4 },
  { id: 'p5', codigo: 'CL', nombre: 'Chile', moneda: 'CLP', activo: true, orden: 5 },
  { id: 'p6', codigo: 'DO', nombre: 'República Dominicana', moneda: 'DOP', activo: true, orden: 6 },
  { id: 'p7', codigo: 'CR', nombre: 'Costa Rica', moneda: 'CRC', activo: true, orden: 7 },
  { id: 'p8', codigo: 'PE', nombre: 'Perú', moneda: 'PEN', activo: false, orden: 8 },
  { id: 'p9', codigo: 'MX', nombre: 'México', moneda: 'MXN', activo: false, orden: 9 },
  { id: 'p10', codigo: 'GT', nombre: 'Guatemala', moneda: 'GTQ', activo: false, orden: 10 },
]
