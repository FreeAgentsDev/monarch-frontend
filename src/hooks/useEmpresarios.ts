import { type Empresario, STORAGE_KEYS } from '../utils/storage'
import { useApiCollection } from './useApiCollection'

function makeId() {
  return `emp_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`
}

const DEFAULT_EMPRESARIOS: Empresario[] = [
  { id: 'e1', nombre: 'Maria Gomez', marca: 'Juacho Jewelry', email: 'maria@juacho.com', telefono: '+57 300 111 2233', paisCodigo: 'CO', activo: true, notas: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'e2', nombre: 'Carlos Ruiz', marca: 'Brilla EC', email: 'carlos@brillaec.com', telefono: '+593 99 876 5432', paisCodigo: 'EC', activo: true, notas: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'e3', nombre: 'Ana Lopez', marca: 'Oro Madrid', email: 'ana@oromadrid.es', telefono: '+34 612 345 678', paisCodigo: 'ES', activo: true, notas: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'e4', nombre: 'Pedro Martinez', marca: 'Lux Bogota', email: 'pedro@luxbogota.co', telefono: '+57 310 222 3344', paisCodigo: 'CO', activo: true, notas: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'e5', nombre: 'Laura Vega', marca: 'Joyeria Quito', email: 'laura@joyeriaquito.ec', telefono: '+593 98 765 4321', paisCodigo: 'EC', activo: false, notas: 'En pausa', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'e6', nombre: 'Diego Herrera', marca: 'Brillantes CL', email: 'diego@brillantes.cl', telefono: '+56 9 1234 5678', paisCodigo: 'CL', activo: true, notas: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
]

export function useEmpresarios() {
  const { items, add, update, remove, loading, reload } = useApiCollection<Empresario>({
    storageKey: STORAGE_KEYS.EMPRESARIOS,
    defaults: DEFAULT_EMPRESARIOS,
    path: '/empresarios',
    prepend: true,
    newLocal: (input) => {
      const now = new Date().toISOString()
      return { id: makeId(), createdAt: now, updatedAt: now, ...input } as Empresario
    },
    mergeLocal: (item, patch) => ({ ...item, ...patch, updatedAt: new Date().toISOString() }),
  })
  return { empresarios: items, add, update, remove, loading, reload }
}
