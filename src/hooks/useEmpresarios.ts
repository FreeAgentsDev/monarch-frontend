import { useEffect, useMemo, useState } from 'react'
import { demoStorage, STORAGE_KEYS, type Empresario } from '../utils/storage'

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
  const [empresarios, setEmpresarios] = useState<Empresario[]>(() => {
    const stored = demoStorage.get<Empresario[]>(STORAGE_KEYS.EMPRESARIOS)
    if (!stored) return DEFAULT_EMPRESARIOS
    // Si hay datos viejos sin paisCodigo/marca, resetear a defaults
    const hasOldData = stored.some((e) => !e.paisCodigo || !e.marca)
    if (hasOldData) {
      demoStorage.remove(STORAGE_KEYS.EMPRESARIOS)
      return DEFAULT_EMPRESARIOS
    }
    return stored
  })

  useEffect(() => {
    demoStorage.set(STORAGE_KEYS.EMPRESARIOS, empresarios)
  }, [empresarios])

  const api = useMemo(() => {
    const add = (input: Omit<Empresario, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString()
      const next: Empresario = { id: makeId(), createdAt: now, updatedAt: now, ...input }
      setEmpresarios((prev) => [next, ...prev])
      return next
    }
    const update = (id: string, patch: Partial<Empresario>) => {
      setEmpresarios((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...patch, updatedAt: new Date().toISOString() } : e))
      )
    }
    const remove = (id: string) => {
      setEmpresarios((prev) => prev.filter((e) => e.id !== id))
    }
    return { add, update, remove }
  }, [])

  return { empresarios, ...api }
}

