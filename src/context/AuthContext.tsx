import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

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
  setUser: (u: User | null) => void
  setRole: (r: Role) => void
  logout: () => void
  login: (username: string, password: string) => { ok: boolean; error?: string }
  loginAsRole: (role: Role, username: string, password: string) => { ok: boolean; error?: string }
}

const defaultUser: User = {
  id: '1',
  name: 'Admin',
  email: 'admin@monarch.com',
  role: 'administrador',
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(defaultUser)
  const [role, setRoleState] = useState<Role>('administrador')

  const setUser = useCallback((u: User | null) => {
    setUserState(u)
    if (u) setRoleState(u.role)
  }, [])

  const setRole = useCallback((r: Role) => {
    setRoleState(r)
    setUserState((prev) => (prev ? { ...prev, role: r } : null))
  }, [])

  const logout = useCallback(() => {
    setUserState(defaultUser)
    setRoleState('administrador')
  }, [])

  const login = useCallback((username: string, password: string): { ok: boolean; error?: string } => {
    const creds: Record<string, string> = {
      superadmin: 'superadmin123',
      admin: 'admin123',
      inversionista: 'inversionista123',
      empresario: 'empresario123',
    }
    const pwd = creds[username.toLowerCase()]
    if (!pwd || pwd !== password) return { ok: false, error: 'Usuario o contraseña incorrectos' }
    const roleMap: Record<string, Role> = {
      superadmin: 'superadmin',
      admin: 'administrador',
      inversionista: 'inversionista',
      empresario: 'empresario',
    }
    const r = roleMap[username.toLowerCase()] ?? 'administrador'
    setUserState({ id: '1', name: username, email: `${username}@monarch.com`, role: r })
    setRoleState(r)
    return { ok: true }
  }, [])

  const loginAsRole = useCallback((r: Role, username: string, password: string): { ok: boolean; error?: string } => {
    const res = login(username, password)
    if (!res.ok) return res
    setRoleState(r)
    setUserState((prev) => (prev ? { ...prev, role: r } : null))
    return { ok: true }
  }, [login])

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        setUser,
        setRole,
        logout,
        login,
        loginAsRole,
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
  const inversionistaPaths = ['/inversionistas', '/inversionistas/vista', '/paises', '/avance-semana']
  const empresarioPaths = ['/empresarios', '/empresarios/pedidos', '/avance-semana']

  if (role === 'superadmin' || role === 'administrador') return true
  if (role === 'inversionista') return inversionistaPaths.some((p) => path.startsWith(p)) || path === '/avance-semana'
  if (role === 'empresario') return empresarioPaths.some((p) => path.startsWith(p)) || path === '/avance-semana'
  return false
}
