import { useState, useEffect, useCallback } from 'react'
import { demoStorage, STORAGE_KEYS, type ProductoCatalogo } from '../utils/storage'

function uid() {
  return `prod_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

const DEFAULT_CATALOGO: ProductoCatalogo[] = [
  { id: 'p1', sku: 'MON-001', nombre: 'Combo Lazo 6mm', categoria: 'Combos', precioMayorista: 45, moneda: 'USD', imagen: '/img/COMBO_LAZO_6MM.webp', activo: true },
  { id: 'p2', sku: 'MON-002', nombre: 'Combo Caracol 4mm', categoria: 'Combos', precioMayorista: 120, moneda: 'USD', imagen: '/img/COMBOCARACOL4MM_2.webp', activo: true },
  { id: 'p3', sku: 'MON-003', nombre: 'Combo Cartier 7mm', categoria: 'Combos', precioMayorista: 35, moneda: 'USD', imagen: '/img/COMBO_CARTIER_7MM.webp', activo: true },
  { id: 'p4', sku: 'MON-004', nombre: 'Combo Grabada 6mm', categoria: 'Combos', precioMayorista: 85, moneda: 'USD', imagen: '/img/COMBO_GRABADA_6MM_2.webp', activo: true },
]

export function useCatalogo() {
  const [productos, setProductos] = useState<ProductoCatalogo[]>(() => {
    return demoStorage.get<ProductoCatalogo[]>(STORAGE_KEYS.CATALOGO) ?? DEFAULT_CATALOGO
  })

  useEffect(() => {
    demoStorage.set(STORAGE_KEYS.CATALOGO, productos)
  }, [productos])

  const add = useCallback((input: Omit<ProductoCatalogo, 'id'>) => {
    const nuevo: ProductoCatalogo = { ...input, id: uid() }
    setProductos((prev) => [...prev, nuevo])
    return nuevo
  }, [])

  const update = useCallback((id: string, patch: Partial<ProductoCatalogo>) => {
    setProductos((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }, [])

  const remove = useCallback((id: string) => {
    setProductos((prev) => prev.filter((p) => p.id !== id))
  }, [])

  return { productos, add, update, remove }
}
