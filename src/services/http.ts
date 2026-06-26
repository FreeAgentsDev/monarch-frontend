// Cliente HTTP para el backend real de Monarch (Go + Gin).
// Si VITE_API_URL está configurada, la app consume el API real; si no, sigue
// usando los JSON estáticos de public/api/ (ver src/services/api.ts).
import axios from 'axios'

const RAW_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '')

/** true cuando hay un backend configurado vía VITE_API_URL. */
export const useRealApi = RAW_BASE.length > 0

export const TOKEN_KEY = 'monarch-token'

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* localStorage no disponible */
  }
}

/** Instancia axios apuntando a `${VITE_API_URL}/api/v1`. */
export const http = axios.create({
  baseURL: `${RAW_BASE}/api/v1`,
})

// Adjunta el token JWT a cada petición si existe.
http.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
