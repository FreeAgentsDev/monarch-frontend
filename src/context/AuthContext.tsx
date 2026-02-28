import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'

export type Role = 'superadmin' | 'administrador' | 'inversionista' | 'empresario'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  paisCodigo?: string
}

interface AuthContextValue {
  user: User | null
  role: Role
  setRole: (r: Role) => void
  login: (username: string, password: string) => { ok: boolean; error?: string }
  /** Iniciar sesión como un rol concreto; exige usuario y contraseña de ese rol. */
  loginAsRole: (role: Role, username: string, password: string) => { ok: boolean; error?: string }
  logout: () => void
}

/** Credenciales por rol (demo; en producción validar contra API) */
const CREDENTIALS: Record<Role, { login: string; password: string; name: string; email: string }> = {
  superadmin: { login: 'superadmin', password: 'superadmin123', name: 'Super Admin', email: 'superadmin@monarch.com' },
  administrador: { login: 'admin', password: 'admin123', name: 'Administrador', email: 'admin@monarch.com' },
  inversionista: { login: 'inversionista', password: 'inversionista123', name: 'Inversionista', email: 'inversionista@monarch.com' },
  empresario: { login: 'empresario', password: 'empresario123', name: 'Empresario', email: 'empresario@monarch.com' },
}

const STORAGE_KEY = 'monarch_auth'

function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const u = JSON.parse(raw) as User
    if (u?.id && u?.name && u?.role) return u
  } catch {
    // ignore
  }
  return null
}

function setStoredUser(u: User | null) {
  if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
  else localStorage.removeItem(STORAGE_KEY)
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(getStoredUser)
  const [role, setRoleState] = useState<Role>(user?.role ?? 'administrador')

  useEffect(() => {
    if (user) {
      setRoleState(user.role)
      setStoredUser(user)
    }
  }, [user])

  const setRole = useCallback((r: Role) => {
    setRoleState(r)
    setUserState((prev) => {
      const next = prev ? { ...prev, role: r } : null
      if (next) setStoredUser(next)
      return next
    })
  }, [])

  const login = useCallback((username: string, password: string): { ok: boolean; error?: string } => {
    const trimmedUser = username.trim().toLowerCase()
    const trimmedPass = password.trim()
    if (!trimmedUser || !trimmedPass) {
      return { ok: false, error: 'Usuario y contraseña son obligatorios.' }
    }
    const entry = (Object.entries(CREDENTIALS) as [Role, typeof CREDENTIALS.superadmin][]).find(
      ([_, c]) => c.login.toLowerCase() === trimmedUser && c.password === trimmedPass
    )
    if (!entry) {
      return { ok: false, error: 'Usuario o contraseña incorrectos.' }
    }
    const [userRole, cred] = entry
    const newUser: User = {
      id: cred.login,
      name: cred.name,
      email: cred.email,
      role: userRole,
    }
    setUserState(newUser)
    setRoleState(userRole)
    setStoredUser(newUser)
    return { ok: true }
  }, [])

  const loginAsRole = useCallback((targetRole: Role, username: string, password: string): { ok: boolean; error?: string } => {
    const trimmedUser = username.trim().toLowerCase()
    const trimmedPass = password.trim()
    if (!trimmedUser || !trimmedPass) {
      return { ok: false, error: 'Usuario y contraseña son obligatorios.' }
    }
    const cred = CREDENTIALS[targetRole]
    if (cred.login.toLowerCase() !== trimmedUser || cred.password !== trimmedPass) {
      return { ok: false, error: 'Usuario o contraseña incorrectos para este rol.' }
    }
    const newUser: User = {
      id: cred.login,
      name: cred.name,
      email: cred.email,
      role: targetRole,
    }
    setUserState(newUser)
    setRoleState(targetRole)
    setStoredUser(newUser)
    return { ok: true }
  }, [])

  const logout = useCallback(() => {
    setUserState(null)
    setRoleState('administrador')
    setStoredUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        setRole,
        login,
        loginAsRole,
        logout,
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
  const adminPaths = ['/dashboard', '/orders', '/accounting', '/contabilidad', '/estado-resultados', '/analisis', '/shopify', '/configuracion', '/gestion-paises', '/gestion-inversionistas']
  const inversionistaPaths = ['/inversionistas', '/inversionistas/vista', '/paises', '/avance-semana']
  const empresarioPaths = ['/empresarios', '/empresarios/pedidos', '/avance-semana']
  if (role === 'superadmin') return true
  if (role === 'administrador') return adminPaths.some((p) => path.startsWith(p)) || path === '/paises' || path === '/inversionistas' || path.startsWith('/inversionistas/') || path === '/avance-semana'
  if (role === 'inversionista') return inversionistaPaths.some((p) => path.startsWith(p)) || path === '/avance-semana'
  if (role === 'empresario') return empresarioPaths.some((p) => path.startsWith(p)) || path === '/avance-semana'
  return false
}
