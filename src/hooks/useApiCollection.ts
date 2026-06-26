import { useState, useEffect, useCallback, useRef } from 'react'
import { http, useRealApi } from '../services/http'
import { demoStorage } from '../utils/storage'

export interface CollectionConfig<T> {
  /** Clave de localStorage (modo demo). */
  storageKey: string
  /** Datos iniciales en modo demo. */
  defaults: T[]
  /** Ruta base en el backend, p. ej. '/empresarios'. */
  path: string
  /** Construye una entidad local (modo demo) a partir del input de `add`. */
  newLocal: (input: any) => T
  /** Aplica un patch a una entidad existente (modo demo). */
  mergeLocal: (item: T, patch: any) => T
  /** Coloca los nuevos al inicio (true) o al final (false). Por defecto false. */
  prepend?: boolean
}

/**
 * Hook genérico de colección con modo dual:
 *  - useRealApi → CRUD contra el backend (carga async, mutaciones async).
 *  - modo demo  → estado en memoria persistido en localStorage.
 *
 * Las firmas (`items`, `add`, `update`, `remove`) se mantienen; `add/update/remove`
 * devuelven Promise pero ningún consumidor depende del valor de retorno síncrono.
 */
export function useApiCollection<T extends { id: string }>(cfg: CollectionConfig<T>) {
  const [items, setItems] = useState<T[]>(() =>
    useRealApi ? [] : demoStorage.get<T[]>(cfg.storageKey) ?? cfg.defaults
  )
  const [loading, setLoading] = useState<boolean>(useRealApi)

  // Ref con los items actuales para poder mergear en update sin re-crear callbacks.
  const itemsRef = useRef(items)
  useEffect(() => {
    itemsRef.current = items
  }, [items])

  const place = useCallback(
    (prev: T[], it: T) => (cfg.prepend ? [it, ...prev] : [...prev, it]),
    [cfg.prepend]
  )

  const reload = useCallback(async () => {
    if (!useRealApi) return
    setLoading(true)
    try {
      const { data } = await http.get<T[]>(cfg.path)
      setItems(data ?? [])
    } finally {
      setLoading(false)
    }
  }, [cfg.path])

  useEffect(() => {
    reload()
  }, [reload])

  // Persistencia solo en modo demo.
  useEffect(() => {
    if (!useRealApi) demoStorage.set(cfg.storageKey, items)
  }, [items, cfg.storageKey])

  const add = useCallback(
    async (input: any): Promise<T> => {
      if (useRealApi) {
        const { data } = await http.post<T>(cfg.path, input)
        setItems((prev) => place(prev, data))
        return data
      }
      const created = cfg.newLocal(input)
      setItems((prev) => place(prev, created))
      return created
    },
    [cfg, place]
  )

  const update = useCallback(
    async (id: string, patch: any): Promise<void> => {
      if (useRealApi) {
        const current = itemsRef.current.find((i) => i.id === id)
        const body = { ...(current as any), ...patch }
        const { data } = await http.put<T>(`${cfg.path}/${id}`, body)
        setItems((prev) => prev.map((i) => (i.id === id ? data : i)))
        return
      }
      setItems((prev) => prev.map((i) => (i.id === id ? cfg.mergeLocal(i, patch) : i)))
    },
    [cfg]
  )

  const remove = useCallback(
    async (id: string): Promise<void> => {
      if (useRealApi) {
        await http.delete(`${cfg.path}/${id}`)
      }
      setItems((prev) => prev.filter((i) => i.id !== id))
    },
    [cfg.path]
  )

  return { items, loading, reload, add, update, remove }
}
