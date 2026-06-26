import { type ProductoCatalogo, STORAGE_KEYS } from '../utils/storage'
import { useApiCollection } from './useApiCollection'

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
  const { items, add, update, remove, loading } = useApiCollection<ProductoCatalogo>({
    storageKey: STORAGE_KEYS.CATALOGO,
    defaults: DEFAULT_CATALOGO,
    path: '/catalogo',
    newLocal: (input) => ({ ...input, id: uid() }) as ProductoCatalogo,
    mergeLocal: (item, patch) => ({ ...item, ...patch }),
  })
  return { productos: items, add, update, remove, loading }
}
