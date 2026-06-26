import { useState, useEffect, useCallback, useRef } from 'react'
import {
  demoStorage,
  STORAGE_KEYS,
  DEFAULT_PAISES,
  Pais,
  Inversionista,
  InversionistaTienda,
} from '../utils/storage'
import { http, useRealApi } from '../services/http'
import { useApiCollection } from './useApiCollection'

function uid() {
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export function usePaises() {
  const { items, add, update, remove, loading } = useApiCollection<Pais>({
    storageKey: STORAGE_KEYS.PAISES,
    defaults: [...DEFAULT_PAISES],
    path: '/countries',
    newLocal: (p) => ({ ...p, id: uid() }) as Pais,
    mergeLocal: (x, p) => ({ ...x, ...p }),
  })
  return { paises: items, add, update, remove, loading }
}

export function useInversionistas() {
  const { items, add, update, remove, loading } = useApiCollection<Inversionista>({
    storageKey: STORAGE_KEYS.INVERSIONISTAS,
    defaults: [],
    path: '/inversionistas',
    newLocal: (inv) => {
      const now = new Date().toISOString()
      return { ...inv, id: uid(), createdAt: now, updatedAt: now } as Inversionista
    },
    mergeLocal: (x, inv) => ({ ...x, ...inv, updatedAt: new Date().toISOString() }),
  })
  return { inversionistas: items, add, update, remove, loading }
}

/**
 * Enlaces inversionista↔tienda. En el backend viven bajo cada inversionista
 * (`/inversionistas/:id/tiendas`), así que en modo API se cargan agregando los de
 * todos los inversionistas. El backend no expone `update` de enlaces (no se usa).
 */
export function useInversionistaTiendas() {
  const [enlaces, setEnlaces] = useState<InversionistaTienda[]>(() =>
    useRealApi ? [] : demoStorage.get<InversionistaTienda[]>(STORAGE_KEYS.INVERSIONISTA_TIENDAS) ?? []
  )
  const enlacesRef = useRef(enlaces)
  useEffect(() => {
    enlacesRef.current = enlaces
  }, [enlaces])

  useEffect(() => {
    if (!useRealApi) return
    let cancelled = false
    ;(async () => {
      try {
        const { data: invs } = await http.get<{ id: string }[]>('/inversionistas')
        const lists = await Promise.all(
          (invs ?? []).map((inv) =>
            http
              .get<InversionistaTienda[]>(`/inversionistas/${inv.id}/tiendas`)
              .then((r) => r.data ?? [])
              .catch(() => [])
          )
        )
        if (!cancelled) setEnlaces(lists.flat())
      } catch {
        if (!cancelled) setEnlaces([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!useRealApi) demoStorage.set(STORAGE_KEYS.INVERSIONISTA_TIENDAS, enlaces)
  }, [enlaces])

  const add = useCallback(async (e: Omit<InversionistaTienda, 'id'>) => {
    if (useRealApi) {
      const { data } = await http.post<InversionistaTienda>(
        `/inversionistas/${e.inversionistaId}/tiendas`,
        e
      )
      setEnlaces((prev) => [...prev, data])
      return data
    }
    const nuevo: InversionistaTienda = { ...e, id: uid() }
    setEnlaces((prev) => [...prev, nuevo])
    return nuevo
  }, [])

  const update = useCallback(async (id: string, e: Partial<InversionistaTienda>) => {
    // El backend no tiene endpoint de update para enlaces; se actualiza localmente.
    setEnlaces((prev) => prev.map((x) => (x.id === id ? { ...x, ...e } : x)))
  }, [])

  const remove = useCallback(async (id: string) => {
    if (useRealApi) {
      const enlace = enlacesRef.current.find((x) => x.id === id)
      if (enlace) {
        await http.delete(`/inversionistas/${enlace.inversionistaId}/tiendas/${id}`)
      }
    }
    setEnlaces((prev) => prev.filter((x) => x.id !== id))
  }, [])

  const getByInversionista = useCallback(
    (inversionistaId: string) => enlaces.filter((e) => e.inversionistaId === inversionistaId),
    [enlaces]
  )

  return { enlaces, add, update, remove, getByInversionista }
}
