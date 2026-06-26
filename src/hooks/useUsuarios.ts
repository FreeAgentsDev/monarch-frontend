import { type UsuarioSistema, STORAGE_KEYS, DEFAULT_USUARIOS } from '../utils/storage'
import { useApiCollection } from './useApiCollection'

function uid() {
  return `u_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

/**
 * Usuarios del sistema. En modo API consume `/users` (solo admin). El `add`
 * acepta un campo `password` adicional requerido por el backend; en modo demo
 * se ignora.
 */
export function useUsuarios() {
  const { items, add, update, remove, loading } = useApiCollection<UsuarioSistema>({
    storageKey: STORAGE_KEYS.USUARIOS,
    defaults: [...DEFAULT_USUARIOS],
    path: '/users',
    newLocal: (input) => {
      const now = new Date().toISOString()
      const { password: _pw, ...rest } = input
      return { id: uid(), createdAt: now, updatedAt: now, ...rest } as UsuarioSistema
    },
    mergeLocal: (item, patch) => {
      const { password: _pw, ...rest } = patch
      return { ...item, ...rest, updatedAt: new Date().toISOString() }
    },
  })
  return { usuarios: items, add, update, remove, loading }
}
