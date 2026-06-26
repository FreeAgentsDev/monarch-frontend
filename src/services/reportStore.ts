// Persistencia dual-mode para reportes editables (cuadro general, estado de
// resultados):
//  - modo demo  → localStorage (demoStorage), igual que antes.
//  - modo API   → backend (/cuadro-general, /estado-resultados). Como las vistas
//    auto-guardan en cada edición, el PUT se hace con debounce y se omite si el
//    contenido no cambió.
//
// La lectura es síncrona (las vistas la usan en inicializadores/efectos); en modo
// API devuelve una caché en memoria que arranca vacía, por lo que las vistas usan
// el documento que ya llega por la prop `data` (cargado vía accountingApi).
import { http, useRealApi } from './http'
import { demoStorage, STORAGE_KEYS } from '../utils/storage'

const PATHS: Record<string, string> = {
  [STORAGE_KEYS.CUADRO_GENERAL]: '/cuadro-general',
  [STORAGE_KEYS.ESTADO_RESULTADOS]: '/estado-resultados',
}

const cache: Record<string, unknown> = {}
const lastSent: Record<string, string> = {}
const timers: Record<string, ReturnType<typeof setTimeout>> = {}

export function getReport<T>(key: string): T | null {
  if (!useRealApi) return demoStorage.get<T>(key)
  return (cache[key] as T) ?? null
}

export function setReport(key: string, data: unknown): void {
  if (!useRealApi) {
    demoStorage.set(key, data)
    return
  }
  const path = PATHS[key]
  if (!path) return
  cache[key] = data
  const serialized = JSON.stringify(data)
  if (lastSent[key] === serialized) return
  clearTimeout(timers[key])
  timers[key] = setTimeout(() => {
    lastSent[key] = serialized
    http.put(path, data).catch(() => {})
  }, 600)
}

export function removeReport(key: string, fallback?: unknown): void {
  if (!useRealApi) {
    demoStorage.remove(key)
    return
  }
  const path = PATHS[key]
  if (!path) return
  cache[key] = fallback ?? null
  if (fallback != null) {
    lastSent[key] = JSON.stringify(fallback)
    http.put(path, fallback).catch(() => {})
  }
}
