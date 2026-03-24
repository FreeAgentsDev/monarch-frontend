import { useEffect, useMemo, useState } from 'react'
import { demoStorage, STORAGE_KEYS, type Empresario } from '../utils/storage'

function makeId() {
  return `emp_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`
}

const DEFAULT_EMPRESARIOS: Empresario[] = [
  {
    id: 'e1',
    nombre: 'María Gómez',
    email: 'maria@demo.com',
    telefono: '+57 300 000 0001',
    activo: true,
    notas: 'Empresaria demo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'e2',
    nombre: 'Carlos Ruiz',
    email: 'carlos@demo.com',
    telefono: '+57 300 000 0002',
    activo: true,
    notas: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export function useEmpresarios() {
  const [empresarios, setEmpresarios] = useState<Empresario[]>(() => {
    return demoStorage.get<Empresario[]>(STORAGE_KEYS.EMPRESARIOS) ?? DEFAULT_EMPRESARIOS
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

