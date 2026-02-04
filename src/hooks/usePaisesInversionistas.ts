import { useState, useEffect, useCallback } from 'react'
import {
  demoStorage,
  STORAGE_KEYS,
  DEFAULT_PAISES,
  Pais,
  Inversionista,
  InversionistaTienda,
} from '../utils/storage'

function uid() {
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export function usePaises() {
  const [paises, setPaises] = useState<Pais[]>(() => {
    const stored = demoStorage.get<Pais[]>(STORAGE_KEYS.PAISES)
    return stored && stored.length > 0 ? stored : [...DEFAULT_PAISES]
  })

  useEffect(() => {
    demoStorage.set(STORAGE_KEYS.PAISES, paises)
  }, [paises])

  const add = useCallback((p: Omit<Pais, 'id'>) => {
    const nuevo: Pais = { ...p, id: uid() }
    setPaises((prev) => [...prev, nuevo])
    return nuevo
  }, [])

  const update = useCallback((id: string, p: Partial<Pais>) => {
    setPaises((prev) =>
      prev.map((x) => (x.id === id ? { ...x, ...p } : x))
    )
  }, [])

  const remove = useCallback((id: string) => {
    setPaises((prev) => prev.filter((x) => x.id !== id))
  }, [])

  return { paises, add, update, remove }
}

export function useInversionistas() {
  const [inversionistas, setInversionistas] = useState<Inversionista[]>(() => {
    const stored = demoStorage.get<Inversionista[]>(STORAGE_KEYS.INVERSIONISTAS)
    return stored || []
  })

  useEffect(() => {
    demoStorage.set(STORAGE_KEYS.INVERSIONISTAS, inversionistas)
  }, [inversionistas])

  const add = useCallback((inv: Omit<Inversionista, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    const nuevo: Inversionista = {
      ...inv,
      id: uid(),
      createdAt: now,
      updatedAt: now,
    }
    setInversionistas((prev) => [...prev, nuevo])
    return nuevo
  }, [])

  const update = useCallback((id: string, inv: Partial<Inversionista>) => {
    setInversionistas((prev) =>
      prev.map((x) =>
        x.id === id ? { ...x, ...inv, updatedAt: new Date().toISOString() } : x
      )
    )
  }, [])

  const remove = useCallback((id: string) => {
    setInversionistas((prev) => prev.filter((x) => x.id !== id))
  }, [])

  return { inversionistas, add, update, remove }
}

export function useInversionistaTiendas() {
  const [enlaces, setEnlaces] = useState<InversionistaTienda[]>(() => {
    const stored = demoStorage.get<InversionistaTienda[]>(STORAGE_KEYS.INVERSIONISTA_TIENDAS)
    return stored || []
  })

  useEffect(() => {
    demoStorage.set(STORAGE_KEYS.INVERSIONISTA_TIENDAS, enlaces)
  }, [enlaces])

  const add = useCallback((e: Omit<InversionistaTienda, 'id'>) => {
    const nuevo: InversionistaTienda = { ...e, id: uid() }
    setEnlaces((prev) => [...prev, nuevo])
    return nuevo
  }, [])

  const update = useCallback((id: string, e: Partial<InversionistaTienda>) => {
    setEnlaces((prev) =>
      prev.map((x) => (x.id === id ? { ...x, ...e } : x))
    )
  }, [])

  const remove = useCallback((id: string) => {
    setEnlaces((prev) => prev.filter((x) => x.id !== id))
  }, [])

  const getByInversionista = useCallback(
    (inversionistaId: string) =>
      enlaces.filter((e) => e.inversionistaId === inversionistaId),
    [enlaces]
  )

  return { enlaces, add, update, remove, getByInversionista }
}
