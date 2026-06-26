import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { http, useRealApi, setToken } from '../services/http'

export type Role = 'admin' | 'inversionista' | 'empresario'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  paisCodigo?: string
}

type LoginResult = { ok: boolean; error?: string; role?: Role }

/** Credenciales por rol (solo modo demo, sin backend). */
const CREDENTIALS_BY_ROLE: Record<Role, { username: string; password: string }> = {
  admin: { username: 'admin', password: 'admin123' },
  inversionista: { username: 'inversionista', password: 'inversionista123' },
  empresario: { username: 'empresario', password: 'empresario123' },
}

const USER_KEY = 'monarch-user'

function loadStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

function storeUser(u: User | null) {
  try {
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u))
    else localStorage.removeItem(USER_KEY)
  } catch {
    /* localStorage no disponible */
  }
}

/** Mapea el usuario del backend (nombre/rol) al modelo del frontend (name/role). */
function mapBackendUser(raw: any): User {
  return {
    id: String(raw?.id ?? ''),
    name: raw?.nombre ?? raw?.name ?? '',
    email: raw?.email ?? '',
    role: (raw?.rol ?? raw?.role ?? 'admin') as Role,
    paisCodigo: raw?.paisCodigo ?? undefined,
  }
}

async function backendLogin(email: string, password: string): Promise<{ token: string; user: User }> {
  const { data } = await http.post<{ token: string; user: any }>('/auth/login', { email, password })
  return { token: data.token, user: mapBackendUser(data.user) }
}

interface AuthContextValue {
  user: User | null
  role: Role
  setUser: (u: User | null) => void
  logout: () => void
  /** Login con rol explícito (modo demo) o por email+password (modo API). */
  login: (selectedRole: Role, username: string, password: string) => Promise<LoginResult>
  /** Login solo con usuario/email y contraseña; el rol se deduce. */
  loginWithCredentials: (username: string, password: string) => Promise<LoginResult>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const initialUser = loadStoredUser()
  const [user, setUserState] = useState<User | null>(initialUser)
  const [role, setRoleState] = useState<Role>(initialUser?.role ?? 'admin')

  const setUser = useCallback((u: User | null) => {
    setUserState(u)
    storeUser(u)
    if (u) setRoleState(u.role)
  }, [])

  const logout = useCallback(() => {
    setUserState(null)
    setRoleState('admin')
    storeUser(null)
    setToken(null)
  }, [])

  const applyUser = useCallback((u: User) => {
    setUserState(u)
    setRoleState(u.role)
    storeUser(u)
  }, [])

  const login = useCallback(async (selectedRole: Role, username: string, password: string): Promise<LoginResult> => {
    if (useRealApi) {
      try {
        const { token, user: u } = await backendLogin(username.trim(), password)
        setToken(token)
        applyUser(u)
        return { ok: true, role: u.role }
      } catch (e: any) {
        return { ok: false, error: e?.response?.data?.error ?? 'Usuario o contraseña incorrectos.' }
      }
    }
    const cred = CREDENTIALS_BY_ROLE[selectedRole]
    const userOk = username.trim().toLowerCase() === cred.username.toLowerCase()
    const passOk = password === cred.password
    if (!userOk || !passOk) return { ok: false, error: 'Usuario o contraseña incorrectos para este rol.' }
    const name = cred.username.charAt(0).toUpperCase() + cred.username.slice(1)
    applyUser({ id: '1', name, email: `${cred.username}@monarch.com`, role: selectedRole })
    return { ok: true, role: selectedRole }
  }, [applyUser])

  const loginWithCredentials = useCallback(async (username: string, password: string): Promise<LoginResult> => {
    if (useRealApi) {
      try {
        const { token, user: u } = await backendLogin(username.trim(), password)
        setToken(token)
        applyUser(u)
        return { ok: true, role: u.role }
      } catch (e: any) {
        return { ok: false, error: e?.response?.data?.error ?? 'Usuario o contraseña incorrectos.' }
      }
    }
    const u = username.trim().toLowerCase()
    for (const [r, cred] of Object.entries(CREDENTIALS_BY_ROLE)) {
      const roleKey = r as Role
      if (u === cred.username.toLowerCase() && password === cred.password) {
        const name = cred.username.charAt(0).toUpperCase() + cred.username.slice(1)
        applyUser({ id: '1', name, email: `${cred.username}@monarch.com`, role: roleKey })
        return { ok: true, role: roleKey }
      }
    }
    return { ok: false, error: 'Usuario o contraseña incorrectos.' }
  }, [applyUser])

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        setUser,
        logout,
        login,
        loginWithCredentials,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function canAccess(role: Role, path: string): boolean {
  const inversionistaPaths = ['/mi-panel', '/catalogo', '/crear-pedido']
  const empresarioPaths = ['/mi-panel', '/mi-tienda', '/catalogo', '/crear-pedido']

  if (role === 'admin') return true
  if (role === 'inversionista') return inversionistaPaths.some((p) => path.startsWith(p))
  if (role === 'empresario') return empresarioPaths.some((p) => path.startsWith(p))
  return false
}
